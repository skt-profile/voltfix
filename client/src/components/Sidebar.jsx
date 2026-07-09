import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuMessageSquareText,
  LuBatteryCharging,
  LuBike,
  LuHistory,
  LuUser,
  LuZap,
  LuX,
} from "react-icons/lu";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/chat", label: "AI Manual Assistant", icon: LuMessageSquareText },
  { to: "/battery-health", label: "Battery Health", icon: LuBatteryCharging },
  { to: "/bikes", label: "My Bikes", icon: LuBike },
  { to: "/service-history", label: "Service History", icon: LuHistory },
  { to: "/profile", label: "Profile", icon: LuUser },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-base-900 border-r border-white/5 flex flex-col
        transform transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-volt-500 flex items-center justify-center shadow-volt-glow">
              <LuZap className="text-base-950" size={18} />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight">VoltFix AI</span>
          </div>
          <button className="lg:hidden text-ink-muted" onClick={onClose} aria-label="Close menu">
            <LuX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 relative ${
                  isActive
                    ? "bg-volt-500/10 text-volt-500"
                    : "text-ink-muted hover:text-ink hover:bg-white/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-volt-500 shadow-volt-glow" />
                  )}
                  <Icon size={18} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="vf-card px-3 py-3 flex items-center gap-2">
            <LuBatteryCharging className="text-volt-500" size={16} />
            <p className="text-xs text-ink-muted leading-snug">
              Ask the AI Assistant anything from your uploaded manuals — with page citations.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
