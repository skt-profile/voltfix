import { motion } from "framer-motion";
import { LuZap, LuUser, LuFileText } from "react-icons/lu";

/**
 * Renders a single chat turn. Assistant messages support a structured
 * "sources" array (manual title + page + snippet) shown as citation chips.
 */
export default function ChatMessage({ role, content, sources = [] }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${
          isUser ? "bg-charge-500/20 text-charge-400" : "bg-volt-500/15 text-volt-500"
        }`}
      >
        {isUser ? <LuUser size={15} /> : <LuZap size={15} />}
      </div>

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={`rounded-xl2 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser ? "bg-charge-500/15 text-ink" : "vf-card text-ink"
          }`}
        >
          {content}
        </div>

        {sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <div
                key={i}
                title={s.snippet}
                className="flex items-center gap-1.5 rounded-md bg-base-700 border border-white/5 px-2.5 py-1 text-xs text-ink-muted cursor-help hover:text-ink hover:border-volt-500/30 transition-colors"
              >
                <LuFileText size={12} className="text-volt-500" />
                {s.manualTitle} · p.{s.page}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
