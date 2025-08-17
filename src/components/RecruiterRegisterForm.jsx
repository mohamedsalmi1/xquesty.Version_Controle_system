import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { recruiterSupabase } from "../lib/supabaseClient";

export default function RecruiterRegisterForm({ onClose, onSwitchForm }) {
  // Define state variables for form values
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    password2: "",
    phoneNumber: ""
  });
  
  // Other state variables
  const [touched, setTouched] = useState({
    name: false,
    company: false,
    email: false,
    password: false,
    password2: false,
    phoneNumber: false,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [debug, setDebug] = useState({ status: "idle", message: null });
  
  const navigate = useNavigate();
  
  // Check API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const apiUrl = window.ENV?.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/health`);
        
        if (response.ok) {
          setDebug({ 
            status: "connected", 
            message: "API connection verified" 
          });
        } else {
          setDebug({ 
            status: "error", 
            message: `API connection error: ${response.status}` 
          });
        }
      } catch (e) {
        setDebug({ 
          status: "error", 
          message: `Failed to connect to API: ${e.message}` 
        });
      }
    };
    
    checkApiConnection();
  }, []);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };
  
  // Field validation logic
  const nameError = touched.name && !values.name ? "Name is required" : "";
  const companyError = touched.company && !values.company ? "Company is required" : "";
  const emailError = touched.email && !values.email ? "Email is required" : 
                    touched.email && !/\S+@\S+\.\S+/.test(values.email) ? "Invalid email format" : "";
  const passwordError = touched.password && !values.password ? "Password is required" : 
                       touched.password && values.password.length < 8 ? "Password must be at least 8 characters" : "";
  const password2Error = touched.password2 && values.password !== values.password2 ? "Passwords do not match" : "";
  const phoneError = touched.phoneNumber && !values.phoneNumber ? "Phone number is required" : "";

  const formValid = !nameError && !companyError && !emailError && !passwordError && !password2Error && !phoneError &&
                  values.name && values.company && values.email && values.password && values.password2 && values.phoneNumber;

  // Form submission handler - Use API endpoint directly
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      company: true,
      email: true,
      password: true,
      password2: true,
      phoneNumber: true,
    });

    if (!values.name.trim() || !values.company.trim() || !values.email.trim() || !values.password || !values.password2 || !values.phoneNumber) {
      setErr("All fields are required. Please fill out the entire form.");
      return;
    }
    if (!formValid) {
      setErr("Please fix the validation errors before submitting.");
      return;
    }
    if (values.password !== values.password2) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErr("");
    setDebug({ status: "registering", message: "Starting registration process..." });

    try {
      // Register recruiter in Supabase auth and recruiters table
      const { data: signUpData, error: signUpError } = await recruiterSupabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: {
            full_name: values.name.trim(),
            company: values.company.trim(),
            role: 'recruiter'
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message || 'Registration failed');
      }

      if (signUpData?.user) {
        // Insert recruiter profile into recruiters table
        const { error: insertError } = await recruiterSupabase
          .from('recruiters')
          .insert([
            {
              user_id: signUpData.user.id,
              company: values.company.trim(),
              full_name: values.name.trim(),
              role: 'recruiter',
              email: values.email.trim(),
              phone_number: values.phoneNumber.trim()
            }
          ]);
        if (insertError) {
          throw new Error(insertError.message || 'Failed to save recruiter profile');
        }

        setDebug({ status: "success", message: "Account created successfully" });
        localStorage.setItem("userData", JSON.stringify({
          id: signUpData.user.id,
          name: values.name.trim(),
          company: values.company.trim(),
          email: values.email.trim(),
          phone_number: values.phoneNumber.trim(),
          role: "recruiter"
        }));
        // Show success and redirect
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          if (onClose) onClose();
          navigate("/matching");
        }, 3000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErr(error.message || "Registration failed. Please try again.");
      setDebug({ 
        status: "error", 
        message: `Registration error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }

  };

  return (
    <>
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold text-center">Create a Recruiter Account</h2>
        
        {debug.status === "error" && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Connection Issue:</strong> {debug.message}
            <br />
            <small>Please check your internet connection or try again later.</small>
          </div>
        )}
        
        {debug.status === "connected" && (
          <div className="p-2 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            ✓ API connected successfully
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {err}
            </div>
          )}
          
          <div>
            <Input
              type="text"
              name="name"
              placeholder="Full Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={nameError ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>
          
          <div>
            <Input
              type="text"
              name="company"
              placeholder="Company Name"
              value={values.company}
              onChange={handleChange}
              onBlur={handleBlur}
              className={companyError ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {companyError && <p className="text-red-500 text-sm mt-1">{companyError}</p>}
          </div>
          
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={emailError ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          
          <div>
            <Input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={values.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className={phoneError ? "border-red-500" : ""}
              disabled={loading}
              required
              pattern="[0-9]{10,15}"
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>
          
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={passwordError ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          
          <div>
            <Input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={values.password2}
              onChange={handleChange}
              onBlur={handleBlur}
              className={password2Error ? "border-red-500" : ""}
              disabled={loading}
              required
            />
            {password2Error && <p className="text-red-500 text-sm mt-1">{password2Error}</p>}
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !formValid}
          >
            {loading ? "Registering..." : "Register as Recruiter"}
          </Button>
          
          {debug.status === "registering" && (
            <div className="text-center text-sm text-blue-600">
              {debug.message}
            </div>
          )}
        </form>
        
        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchForm}
            className="text-blue-500 hover:underline"
            disabled={loading}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your recruiter account has been created successfully. You will be redirected to the dashboard.
              </p>
              <div className="text-sm text-gray-500">
                Redirecting in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
