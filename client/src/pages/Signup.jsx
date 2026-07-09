import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuZap, LuMail, LuLock, LuUser } from "react-icons/lu";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-volt-glow pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-lg bg-volt-500 flex items-center justify-center shadow-volt-glow">
            <LuZap className="text-base-950" size={20} />
          </div>
          <span className="font-display font-semibold text-xl">VoltFix AI</span>
        </Link>

        <div className="vf-card p-7">
          <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-ink-muted mb-6">Start diagnosing smarter in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="vf-label">Full name</label>
              <div className="relative">
                <LuUser className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="vf-input pl-10"
                  placeholder="Jordan Rivera"
                />
              </div>
            </div>
            <div>
              <label className="vf-label">Email</label>
              <div className="relative">
                <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="vf-input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="vf-label">Password</label>
              <div className="relative">
                <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="vf-input pl-10"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="vf-btn-primary w-full mt-2">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-volt-500 hover:text-volt-400 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
