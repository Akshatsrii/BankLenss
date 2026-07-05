/**
 * AppRoutes.jsx — final with all routes
 */

import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login        from "../pages/Login";
import Signup       from "../pages/Signup";
import Dashboard    from "../pages/Dashboard";
import Upload       from "../pages/Upload";
import Transactions from "../pages/Transactions";
import Statements   from "../pages/Statements";
import Analytics    from "../pages/Analytics";
import Profile      from "../pages/Profile";
import Ledger       from "../pages/Ledger";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected */}
      <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload"      element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/statements"  element={<ProtectedRoute><Statements /></ProtectedRoute>} />
      <Route path="/analytics"   element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/ledger"      element={<ProtectedRoute><Ledger /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}