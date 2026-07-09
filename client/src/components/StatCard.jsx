import { motion } from "framer-motion";

/**
 * Dashboard stat card. When `chargePercent` is provided, renders the
 * VoltFix signature charge-arc ring instead of a plain icon — a visual
 * motif borrowed from the bike's own battery gauge.
 */
export default function StatCard({ label, value, unit, icon: Icon, chargePercent, accent = "volt" }) {
  const accentClass = accent === "charge" ? "text-charge-400" : "text-volt-500";
  const strokeColor = accent === "charge" ? "#3D8BFF" : "#C8FF3D";

  const circumference = 2 * Math.PI * 26;
  const offset =
    chargePercent !== undefined ? circumference - (chargePercent / 100) * circumference : circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="vf-card p-5 flex items-center justify-between gap-4"
    >
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-muted font-mono mb-1.5">{label}</p>
        <p className="font-display text-2xl font-semibold text-ink">
          {value}
          {unit && <span className="text-sm text-ink-muted font-body ml-1">{unit}</span>}
        </p>
      </div>

      {chargePercent !== undefined ? (
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#1A222C" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke={strokeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold ${accentClass}`}>
            {chargePercent}%
          </span>
        </div>
      ) : (
        Icon && (
          <div className={`h-11 w-11 rounded-lg bg-white/5 flex items-center justify-center shrink-0 ${accentClass}`}>
            <Icon size={20} />
          </div>
        )
      )}
    </motion.div>
  );
}
