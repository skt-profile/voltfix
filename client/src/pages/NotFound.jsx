import { Link } from "react-router-dom";
import { LuZap } from "react-icons/lu";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-950 flex flex-col items-center justify-center text-center p-4">
      <div className="h-12 w-12 rounded-lg bg-volt-500 flex items-center justify-center shadow-volt-glow mb-6">
        <LuZap className="text-base-950" size={24} />
      </div>
      <h1 className="font-display text-6xl font-semibold mb-2">404</h1>
      <p className="text-ink-muted mb-6">This route ran out of charge. Let's get you back on track.</p>
      <Link to="/" className="vf-btn-primary">
        Back to home
      </Link>
    </div>
  );
}
