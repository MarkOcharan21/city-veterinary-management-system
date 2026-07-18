import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", roles: ["admin"] },
  {
    to: "/pets",
    label: "Pets",
    roles: ["admin", "vet", "cashier", "pet_owner"],
  },
  { to: "/owners", label: "Owners", roles: ["admin", "cashier"] },
  { to: "/vaccinations", label: "Vaccinations", roles: ["admin", "vet"] },
  { to: "/payments", label: "Payments", roles: ["admin", "cashier"] },
  { to: "/records", label: "Records", roles: ["admin", "vet"] },
  { to: "/barangay", label: "Barangay", roles: ["admin"] },
  { to: "/system-records", label: "System Records", roles: ["admin"] },
  { to: "/reports", label: "Reports", roles: ["admin"] },
  { to: "/users", label: "Users", roles: ["admin"] },
  { to: "/audit", label: "Audit Trail", roles: ["admin"] },
  { to: "/drafts", label: "Drafts", roles: ["admin"] },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const visibleLinks = navLinks.filter((link) =>
    link.roles.includes(user?.role),
  );

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    logout();

    setMenuOpen(false);

    navigate("/login");
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg tracking-tight">🐾 CityVet</span>

          {/* Desktop Navigation */}

          <div className="hidden lg:flex gap-1 ml-4">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium
                ${
                  location.pathname === link.to
                    ? "bg-white text-blue-800"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:block text-xs text-blue-200">
            {user?.full_name}

            <span className="opacity-50"> · </span>

            {user?.role}
          </span>

          <button
            onClick={handleLogout}
            className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>

          <button
            className="lg:hidden text-white"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}

      {menuOpen && (
        <div className="lg:hidden bg-blue-900 px-6 pb-4 flex flex-col gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`py-2 text-sm border-b border-blue-800 transition
              ${
                location.pathname === link.to
                  ? "text-white font-semibold"
                  : "text-blue-100 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
