import { Routes, Route, Navigate } from "react-router-dom";
import Upload from "../pages/Upload";
import Transactions from "../pages/Transactions";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  );
}