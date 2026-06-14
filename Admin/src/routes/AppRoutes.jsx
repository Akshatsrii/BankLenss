import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login        from "../pages/Login";
import Signup       from "../pages/Signup";
import Upload       from "../pages/Upload";
import Transactions from "../pages/Transactions";
import Statements   from "../pages/Statements";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route path="/upload" element={
        <ProtectedRoute><Upload /></ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute><Transactions /></ProtectedRoute>
      } />
      <Route path="/statements" element={
        <ProtectedRoute><Statements /></ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="*" element={<Navigate to="/upload" replace />} />
    </Routes>
  );
}