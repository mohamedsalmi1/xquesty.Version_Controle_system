/**
 * ProtectedRoute component restricts access to routes based on authentication and user role.
 * It checks if the user is logged in and optionally if they have the required role.
 * If not authenticated, it redirects to the login page.
 * If the required role is not met, it redirects to the home page.
 * Otherwise, it renders the child routes.
 *
 * This file protects any route or component wrapped by <ProtectedRoute> in your app's routing.
 * Only authenticated users (and optionally users with a specific role) can access those routes.
 */
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { studentSupabase, recruiterSupabase, getUserRole, getRecruiterRole } from "../lib/supabaseClient";

const ProtectedRoute = ({ children, requiredRole, redirectPath }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  // Check for both authToken and userData in localStorage
  const hasLocalAuth = Boolean(localStorage.getItem('authToken') && localStorage.getItem('userData'));

  // Set default redirectPath based on requiredRole
  const effectiveRedirectPath =
    redirectPath ||
    (requiredRole === "recruiter"
      ? "/recruiter"
      : requiredRole === "student"
      ? "/student"
      : "/login");

  useEffect(() => {
    let isMounted = true;

    // Select supabase client and role getter based on requiredRole
    const supabaseClient = requiredRole === "recruiter" ? recruiterSupabase : studentSupabase;
    const roleGetter = requiredRole === "recruiter" ? getRecruiterRole : getUserRole;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (isMounted) {
          // Must have both localStorage keys and Supabase session
          const authenticated = !!session && hasLocalAuth;
          setIsAuthenticated(authenticated);
          if (authenticated) {
            const role = await roleGetter();
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        // Must have both localStorage keys and Supabase session
        const authenticated = !!session && hasLocalAuth;
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const role = await roleGetter();
          setUserRole(role);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [requiredRole]);  // Add requiredRole to dependencies

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on role
    return <Navigate to={effectiveRedirectPath} state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  // If authenticated, render the child routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;