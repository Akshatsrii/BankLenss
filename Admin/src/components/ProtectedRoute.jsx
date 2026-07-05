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

const INK        = "#0A0E17";
const BORDER_SOFT= "#1B202B";
const GOLD       = "#C9A227";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking auth state — render nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: INK }}>
        <div
          className="w-6 h-6 rounded-full animate-spin"
          style={{ border: `2px solid ${BORDER_SOFT}`, borderTopColor: GOLD }}
        />
      </div>
    );
  }

  // Not logged in — redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}