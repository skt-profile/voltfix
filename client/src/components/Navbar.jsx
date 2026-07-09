import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuMenu, LuBell, LuChevronDown, LuLogOut, LuUser } from "react-icons/lu";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-white/5 bg-base-950/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-ink-muted hover:text-ink" onClick={onMenuClick} aria-label="Open menu">
          <LuMenu size={22} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-white/5 transition-colors"
          aria-label="Notifications"
        >
          <LuBell size={18} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-volt-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-charge-500/20 border border-charge-500/40 flex items-center justify-center text-charge-400 font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            <LuChevronDown size={14} className="text-ink-muted" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 vf-card py-1.5 z-20">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-ink-muted hover:text-ink hover:bg-white/5"
                >
                  <LuUser size={15} /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LuLogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
