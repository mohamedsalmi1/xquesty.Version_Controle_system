import React, { useState } from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { HiOutlineEye, HiOutlineEyeOff, HiCheckCircle } from "react-icons/hi";
import { studentSupabase, createUserProfile } from "../lib/supabaseClient";

export function StudentRegisterForm({ onSwitchForm, onClose }) {
  const [values, setValues] = useState({
    name: "",
    university: "",
    email: "",
    pw: "",
    pw2: ""
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [touched, setTouched] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Validation
  const nameValid = values.name.trim().length >= 2;
  const universityValid = values.university.trim().length >= 2;
  const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.email);
  const pwValid = values.pw.length >= 6;
  const confirmPwValid = values.pw2 === values.pw && values.pw2.length > 0;

  const formValid = nameValid && universityValid && emailValid && pwValid && confirmPwValid;

  function handleChange(e) {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  }
  function handleBlur(e) {
    setTouched(t => ({ ...t, [e.target.name]: true }));
  }

  let debounceTimeout;

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, university: true, email: true, pw: true, pw2: true });
    if (!formValid) return;

    if (!studentSupabase) {
      setErr("Supabase client is not initialized. Please contact support.");
      return;
    }

    // Debounce to prevent rapid submissions
    if (debounceTimeout) {
      setErr("Please wait before submitting again.");
      return;
    }
    debounceTimeout = setTimeout(() => {
      debounceTimeout = null;
    }, 5000); // 5 seconds debounce

    setLoading(true);
    setErr('');

    let attempts = 0;
    const maxAttempts = 3;
    const retryDelay = 3000; // 3 seconds

    while (attempts < maxAttempts) {
      try {
        // 1. Sign up the user
        const { data, error: authError } = await studentSupabase.auth.signUp({
          email: values.email.trim(),
          password: values.pw,
          options: {
            data: {
              full_name: values.name.trim(),
              university: values.university.trim(),
              role: 'student'
            }
          }
        });

        if (authError) {
          console.error('Auth error:', authError); // Log full error details
          throw new Error(authError.message || 'Failed to create account');
        }

        if (!data?.user) {
          throw new Error('No user data returned from authentication');
        }

        console.log('User created successfully:', data.user.id);
        
        // Store the session in localStorage for immediate access
        // This lets HelloS verify the user immediately
        if (data.session) {
          localStorage.setItem('sb-session', JSON.stringify(data.session));
          localStorage.setItem('authToken', data.session.access_token);
          console.log('Session saved to localStorage');
        }

        // 2. Profile creation temporarily disabled
        // try {
        //   await createUserProfile(studentSupabase, {
        //     id: data.user.id,
        //     email: data.user.email,
        //     user_metadata: data.user.user_metadata
        //   });
        //   console.log('Profile created successfully');
        // } catch (profileError) {
        //   console.warn('Profile creation warning:', profileError);
        // }

        // Show success modal instead of alert
        setShowSuccessModal(true);
        // After 3 seconds, close the modal and navigate
        setTimeout(() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
          window.location.href = "/interview";
        }, 3000);
        return;
      } catch (error) {
        console.error('Registration error:', error); // Log full error details
        setErr(error.message || "Registration failed - please try again later");

        if (error.message.includes("rate limit")) {
          attempts++;
          if (attempts < maxAttempts) {
            setErr(`Rate limit exceeded. Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          } else {
            setErr("Too many registration attempts. Please wait a few minutes and try again.");
          }
        } else {
          setErr(error.message || "Registration failed - please try again later");
        }
      } finally {
        setLoading(false);
      }
    }
  }

  // Success Modal Component
  const SuccessModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl animate-scaleIn">
          <div className="flex flex-col items-center text-center">
            <HiCheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-4">
              Please check your email to confirm your account.
            </p>
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                if (onClose) onClose();
                window.location.href = "/interview";
              }}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <form
        className="px-6 pb-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
        aria-label="Student Registration"
      >
        <p className="text-muted-foreground mb-4">Create a student account to begin.</p>
        <label className="flex flex-col font-medium gap-1">
          Full Name
          <input
            name="name"
            type="text"
            className={`
              border rounded-md px-3 py-2 text-base outline-none transition
              focus:ring-2 focus:ring-blue-500
              ${touched.name && !nameValid ? "border-red-500" : "border-gray-300"}
            `}
            aria-invalid={!nameValid}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.name && (
            nameValid ?
              <span className="text-green-600 text-sm">✓ Name looks good</span>
              :
              <span className="text-red-600 text-sm">Enter your full name</span>
          )}
        </label>
        <label className="flex flex-col font-medium gap-1">
          University
          <input
            name="university"
            type="text"
            className={`
              border rounded-md px-3 py-2 text-base outline-none transition
              focus:ring-2 focus:ring-blue-500
              ${touched.university && !universityValid ? "border-red-500" : "border-gray-300"}
            `}
            aria-invalid={!universityValid}
            value={values.university}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.university && (
            universityValid ?
              <span className="text-green-600 text-sm">✓ University looks good</span>
              :
              <span className="text-red-600 text-sm">Enter your university</span>
          )}
        </label>
        <label className="flex flex-col font-medium gap-1">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={`
              border rounded-md px-3 py-2 text-base outline-none transition
              focus:ring-2 focus:ring-blue-500
              ${touched.email && !emailValid ? "border-red-500" : "border-gray-300"}
            `}
            aria-invalid={!emailValid}
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && (
            emailValid ?
              <span className="text-green-600 text-sm">✓ Email looks good</span>
              :
              <span className="text-red-600 text-sm">Enter a valid email</span>
          )}
        </label>
        <label className="flex flex-col font-medium gap-1 relative">
          Password
          <div className="relative">
            <input
              name="pw"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              className={`
                border rounded-md px-3 py-2 text-base outline-none transition w-full pr-10
                focus:ring-2 focus:ring-blue-500
                ${touched.pw && !pwValid ? "border-red-500" : "border-gray-300"}
              `}
              aria-invalid={!pwValid}
              value={values.pw}
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
          {touched.pw && (
            pwValid ?
              <span className="text-green-600 text-sm">✓ Password OK</span>
              :
              <span className="text-red-600 text-sm">At least 6 characters</span>
          )}
        </label>
        <label className="flex flex-col font-medium gap-1 relative">
          Confirm Password
          <div className="relative">
            <input
              name="pw2"
              type={showPw2 ? "text" : "password"}
              autoComplete="new-password"
              className={`
                border rounded-md px-3 py-2 text-base outline-none transition w-full pr-10
                focus:ring-2 focus:ring-blue-500
                ${touched.pw2 && !confirmPwValid ? "border-red-500" : "border-gray-300"}
              `}
              aria-invalid={!confirmPwValid}
              value={values.pw2}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center"
              tabIndex={-1}
              aria-label={showPw2 ? "Hide password" : "Show password"}
              onClick={() => setShowPw2(s => !s)}
            >
              {showPw2 ? (
                <HiOutlineEyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <HiOutlineEye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {touched.pw2 && (
            confirmPwValid ?
              <span className="text-green-600 text-sm">✓ Passwords match</span>
              :
              <span className="text-red-600 text-sm">Passwords must match</span>
          )}
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
              Registering...
            </span>
          ) : (
            "Register"
          )}
        </Button>
        <div className="text-center pt-2">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-blue-700 font-semibold"
            onClick={() => onSwitchForm("login")}
          >
            Already have an account? Login
          </button>
        </div>
      </form>
      
      {/* Render success modal when needed */}
      {showSuccessModal && <SuccessModal />}

      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}</style>
    </>
  );
}
