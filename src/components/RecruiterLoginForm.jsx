import React, { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { recruiterSupabase } from "../lib/supabaseClient";

export function RecruiterLoginForm({ onSwitchForm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Email/password validation
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!formValid) return;

    setLoading(true);
    setErr("");
    try {
      // Use recruiterSupabase for login
      console.debug("Attempting recruiter login", { email });
      const { data, error } = await recruiterSupabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        setErr(error.message || "Login failed");
        setLoading(false);
        return;
      }
      // Wait for session to be available
      let session = null;
      let tries = 0;
      while (!session && tries < 4) {
        const sessionResp = await recruiterSupabase.auth.getSession();
        session = sessionResp.data?.session;
        if (!session) {
          await new Promise(res => setTimeout(res, 500));
          tries++;
        }
      }
      if (!session) {
        setErr("Session not available after login. Please try again.");
        setLoading(false);
        return;
      }
      // Check if user is a recruiter
      const userMeta = session.user?.user_metadata || {};
      if (userMeta.role !== 'recruiter') {
        setErr("This account is not registered as a recruiter.");
        await recruiterSupabase.auth.signOut();
        setLoading(false);
        return;
      }
      // Store recruiter user data in localStorage
      const recruiterData = {
        id: session.user.id,
        name: userMeta.full_name,
        company: userMeta.company,
        email: session.user.email,
        role: "recruiter"
      };
      // Store both userData and authToken (JWT or mock token)
      localStorage.setItem('userData', JSON.stringify(recruiterData));
      if (session.access_token) {
        localStorage.setItem('authToken', session.access_token);
      }
      console.debug("Recruiter userData and authToken set in localStorage:", recruiterData, session.access_token);
      if (onClose) onClose();
      navigate("/matching");
    } catch (catchError) {
      console.error("Connection error:", catchError);
      setErr("Connection error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-6 pb-6 flex flex-col gap-4" aria-label="Recruiter Login">
      <p className="text-muted-foreground mb-4">Access your dashboard and start recruiting.</p>

      {/* Email/Password login form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col font-medium gap-1">
          Email
          <input
            type="email"
            className={`border rounded-md px-3 py-2 text-base outline-none transition ${
              touched.email && !emailValid ? "border-red-500" : "border-gray-300"
            }`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({...t, email: true}))}
          />
          {touched.email && !emailValid && <span className="text-red-600 text-sm">Enter a valid email</span>}
        </label>

        <label className="flex flex-col font-medium gap-1 relative">
          Password
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`border rounded-md px-3 py-2 text-base outline-none transition w-full pr-10 ${
                touched.password && !passwordValid ? "border-red-500" : "border-gray-300"
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({...t, password: true}))}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? (
                <HiOutlineEyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <HiOutlineEye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {touched.password && !passwordValid && <span className="text-red-600 text-sm">Password must be at least 6 characters</span>}
        </label>

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={!formValid || loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </form>
      
      <div className="text-center pt-2">
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-blue-700 font-semibold"
          onClick={() => onSwitchForm("register")}
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}