import React, { useState } from "react";
import { Button } from "./ui/button";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { studentSupabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export function StudentLoginForm({ onSwitchForm, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Simple validation
  const emailValid = /^\S+@\S+\.\S+$/.test(email);
  const pwValid = password.length >= 6;

  const formValid = emailValid && pwValid;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!formValid) return;
    
    setLoading(true);
    setErr('');
    
    try {
      const { error, data } = await studentSupabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setErr(error.message || "Login failed—incorrect credentials.");
      } else {
        // Check if user is a student
        if (data.user.user_metadata.role !== 'student') {
          setErr("This account is not registered as a student.");
          await studentSupabase.auth.signOut();
          return;
        }
        if (onClose) onClose();
        window.location.href = "/interview";
      }
    } catch (catchError) {
      setErr("Connection error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="px-6 pb-6 flex flex-col gap-4"
      onSubmit={handleSubmit}
      aria-label="Student Login"
    >
      <p className="text-muted-foreground mb-4">Access your student dashboard and apply for internships.</p>
      <label className="flex flex-col font-medium gap-1">
        Email
        <input
          type="email"
          autoFocus
          autoComplete="email"
          className={`
            border rounded-md px-3 py-2 text-base outline-none transition
            focus:ring-2 focus:ring-blue-500
            ${touched.email && !emailValid ? "border-red-500" : "border-gray-300"}
          `}
          aria-invalid={!emailValid}
          aria-describedby="email-desc"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onBlur={() => setTouched(t => ({...t, email: true}))}
        />
        {touched.email && (
          emailValid ? 
          <span className="text-green-600 text-sm">✓ Email looks good</span>
          :
          <span id="email-desc" className="text-red-600 text-sm">Enter a valid email</span>
        )}
      </label>
      <label className="flex flex-col font-medium gap-1 relative">
        Password
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            className={`
              border rounded-md px-3 py-2 text-base outline-none w-full pr-10
              transition focus:ring-2 focus:ring-blue-500
              ${touched.password && !pwValid ? "border-red-500" : "border-gray-300"}
            `}
            aria-invalid={!pwValid}
            aria-describedby="pw-desc"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(t => ({...t, password: true}))}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
            onClick={() => setShowPw(s => !s)}
          >
            {showPw ? (
              <HiOutlineEyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <HiOutlineEye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
        {touched.password && (
          pwValid ? 
          <span className="text-green-600 text-sm">✓ Password OK</span>
          :
          <span id="pw-desc" className="text-red-600 text-sm">At least 6 characters</span>
        )}
        <a
          href="#"
          className="text-xs self-end mt-1 text-blue-700 hover:underline"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            alert("Forgot password functionality coming soon!");
          }}
        >
          Forgot Password?
        </a>
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
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Logging in...
          </span>
        ) : (
          "Login"
        )}
      </Button>
      <div className="text-center pt-2">
        <button
          type="button"
          className="text-sm text-gray-600 hover:text-blue-700 font-semibold"
          onClick={() => onSwitchForm("register")}
        >
          Don't have an account? Register
        </button>
      </div>
    </form>
  );
}
