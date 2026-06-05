import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <AppRoutes />
    </div>
  );
}