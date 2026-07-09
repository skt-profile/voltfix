import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuZap,
  LuMessageSquareText,
  LuBatteryCharging,
  LuSearchCode,
  LuWrench,
  LuArrowRight,
} from "react-icons/lu";

const features = [
  {
    icon: LuMessageSquareText,
    title: "AI Manual Assistant",
    desc: "Upload service and repair manuals. Ask questions in plain language and get step-by-step answers with page citations.",
  },
  {
    icon: LuBatteryCharging,
    title: "Battery Health Predictor",
    desc: "Feed in age, cycles, and usage. Get a health score, expected remaining life, and an AI explanation.",
  },
  {
    icon: LuSearchCode,
    title: "Error Code Interpreter",
    desc: "Enter a brand, model, and error code. Get the meaning, cause, repair steps, and cost estimate.",
  },
  {
    icon: LuWrench,
    title: "Service Quote Generator",
    desc: "Describe the symptoms. Get a technician-style report with urgency, time, and cost estimates.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-950 text-ink overflow-hidden">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-volt-500 flex items-center justify-center shadow-volt-glow">
            <LuZap className="text-base-950" size={18} />
          </div>
          <span className="font-display font-semibold text-lg">VoltFix AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="vf-btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="vf-btn-primary">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 lg:px-10 pt-16 pb-24 max-w-6xl mx-auto">
        <div className="absolute inset-0 bg-volt-glow pointer-events-none" />
        <div className="relative">
          <p className="vf-eyebrow mb-4">Smart electric bike diagnostics</p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] max-w-3xl"
          >
            Diagnose, predict, and maintain your e-bike with AI that's read the manual.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-5 text-ink-muted text-lg max-w-xl"
          >
            VoltFix AI turns your bike's service manuals into an on-demand technician —
            plus battery health forecasting, error diagnosis, and maintenance tracking in one dashboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8 flex items-center gap-4"
          >
            <Link to="/signup" className="vf-btn-primary text-base px-6 py-3">
              Start free <LuArrowRight size={16} />
            </Link>
            <Link to="/login" className="vf-btn-secondary text-base px-6 py-3">
              I have an account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 lg:px-10 pb-28 max-w-6xl mx-auto">
        <div className="vf-trace mb-12" />
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="vf-card p-6"
            >
              <div className="h-10 w-10 rounded-lg bg-volt-500/10 text-volt-500 flex items-center justify-center mb-4">
                <Icon size={19} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="px-6 lg:px-10 py-8 border-t border-white/5 text-center text-xs text-ink-faint">
        © {new Date().getFullYear()} VoltFix AI. Built for riders who fix things right.
      </footer>
    </div>
  );
}
