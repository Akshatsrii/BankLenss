import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const location = useLocation();
  const showNavbar = !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100">
      {showNavbar && <Navbar />}
      <AppRoutes />
    </div>
  );
}