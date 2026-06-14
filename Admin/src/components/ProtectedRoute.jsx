/**
 * ProtectedRoute.jsx
 *
 * Wraps any route that requires authentication.
 * - Shows nothing while auth state is loading
 * - Redirects to /login if no user
 * - Renders children if authenticated
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth state — render nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-slate-700
                        border-t-blue-500 animate-spin" />
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}