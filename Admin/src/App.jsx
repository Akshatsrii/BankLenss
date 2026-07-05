import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100">
      <Navbar />
      <AppRoutes />
    </div>
  );
}