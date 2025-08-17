import React, { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export function LoginForm({ onSwitchForm, onClose }) {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const emailValid = /^\S+@\S+\.\S+$/.test(values.email);
  const passwordValid = values.password.length >= 8;

  const formValid = emailValid && passwordValid;

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function handleBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      email: true,
      password: true,
    });
    if (!formValid) return;

    setLoading(true);
    setErr("");

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed. Please try again.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          console.error("Failed to parse error response as JSON.");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Store auth token and user type in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', data.userType);

      // Redirect based on user type
      if (data.userType === 'recruiter') {
        navigate('/matching');
      } else {
        window.location.href = '/interview';
      }

    } catch (error) {
      console.error("Login error:", error);
      if (error.message === "Failed to fetch") {
        setErr("Connection error: Backend server is not running. Please start the server or contact support.");
      } else {
        setErr(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="px-6 pb-6 flex flex-col gap-4" onSubmit={handleSubmit} aria-label="Login">
      <p className="text-muted-foreground mb-4">Welcome back! Please log in to your account.</p>
      <label className="flex flex-col font-medium gap-1">
        Work Email
        <input
          name="email"
          type="email"
          className={`border rounded-md px-3 py-2 text-base outline-none transition ${
            touched.email && !emailValid ? "border-red-500" : "border-gray-300"
          }`}
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && !emailValid && <span className="text-red-600 text-sm">Enter a valid email</span>}
      </label>
      <label className="flex flex-col font-medium gap-1">
        Password
        <div className="relative">
          <input
            name="password"
            type={showPw ? "text" : "password"}
            className={`border rounded-md px-3 py-2 text-base outline-none transition w-full pr-10 ${
              touched.password && !passwordValid ? "border-red-500" : "border-gray-300"
            }`}
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
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
      </label>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <Button type="submit" size="lg" className="w-full mt-2" disabled={!formValid || loading} aria-busy={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
            Logging in...
          </span>
        ) : (
          "Log In"
        )}
      </Button>
    </form>
  );
}