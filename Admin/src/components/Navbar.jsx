import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:text-white hover:bg-slate-700"
    }`;

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-2 shadow-md">
      <span className="text-blue-400 font-bold text-lg mr-6">
        BankDigitizer
      </span>
      <Link to="/upload" className={linkClass("/upload")}>
        Upload
      </Link>
      <Link to="/transactions" className={linkClass("/transactions")}>
        Transactions
      </Link>
    </nav>
  );
}