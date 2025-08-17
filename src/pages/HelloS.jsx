import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import config from '../config';
import { studentSupabase } from "../lib/supabaseClient";

export default function HelloStudent() {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Authentication check for students
    const verifyStudentAuth = async () => {
      try {
        // First check if we have stored user data (from registration, login, or previous session)
        const storedUserData = localStorage.getItem('userData');
        const storedAuthToken = localStorage.getItem('authToken');
        if (storedUserData && storedAuthToken) {
          try {
            const userData = JSON.parse(storedUserData);
            if (userData) {
              console.log('Using stored user data:', userData);
              setStudentData({
                name: userData.name || userData.full_name || 'Student',
                email: userData.email,
                university: userData.university || 'Your University',
                major: userData.major || 'Your Major',
              });
              setAuthError(false);
              setLoading(false);
              return;
            }
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
          }
        }
        
        // Try the Supabase session
        const { data: { session }, error: sessionError } = await studentSupabase?.auth.getSession() || {};
        
        // If we have a valid Supabase session, use that data
        if (session?.user) {
          const userData = {
            name: session.user.user_metadata?.full_name || 'Student',
            email: session.user.email,
            university: session.user.user_metadata?.university || 'Your University',
            major: session.user.user_metadata?.major || 'Your Major',
            id: session.user.id
          };
          // Store both userData and authToken
          localStorage.setItem('userData', JSON.stringify(userData));
          if (session.access_token) {
            localStorage.setItem('authToken', session.access_token);
          }
          console.log('Found user data in Supabase session:', userData);
          setStudentData(userData);
          setAuthError(false);
          setLoading(false);
          return;
        }
        
        // Then try local token
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.log('No auth token found in localStorage');
          setAuthError(true);
          setLoading(false);
          return;
        }
        
        // Try to verify with backend if user is authenticated and is a student
        console.log('Attempting to verify with backend API');
        const response = await fetch(`${config.apiUrl}/api/verify-student`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          console.log('API verification failed with status:', response.status);
          setAuthError(true);
          setLoading(false);
          return;
        }

        const data = await response.json();
        // Store both userData and authToken
        localStorage.setItem('userData', JSON.stringify(data));
        localStorage.setItem('authToken', token);
        console.log('API verification successful:', data);
        setStudentData(data);
        setAuthError(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setAuthError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyStudentAuth();
  }, [navigate]);

  // Redirect to login if not authenticated - but with a delay to show errors
  useEffect(() => {
    let redirectTimer;
    if (authError && !loading) {
      console.log('Authentication failed, redirecting to login...');
      redirectTimer = setTimeout(() => {
        navigate("/student", { state: { message: "Please login as a student to access this page" } });
      }, 1500);
    }
    return () => clearTimeout(redirectTimer);
  }, [authError, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-8">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {studentData?.name || 'Student'}!
              </h1>
              <p className="text-gray-500">
                {studentData?.university || 'Your University'} • {studentData?.major || 'Your Major'}
              </p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Student Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">Complete Your Profile</h3>
              <p className="text-gray-600 mb-4">Enhance your profile to stand out to potential employers.</p>
              <Button className="w-full">Update Profile</Button>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2 text-purple-800">Browse Internships</h3>
              <p className="text-gray-600 mb-4">Find internships that match your skills and interests.</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Find Opportunities</Button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-lg mb-4">Your Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-gray-500 text-sm">Applications</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-gray-500 text-sm">Interviews</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-gray-500 text-sm">Offers</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">70%</div>
                <div className="text-gray-500 text-sm">Profile Strength</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>This is a protected page only accessible to students.</p>
          <button 
            className="text-blue-500 hover:underline mt-2" 
            onClick={() => {
              // Implement logout logic
                // Remove both authToken and userData
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
              navigate("/");
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
