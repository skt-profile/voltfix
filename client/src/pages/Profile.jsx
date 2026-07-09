import { useState } from "react";
import toast from "react-hot-toast";
import { LuUser, LuLock, LuGlobe } from "react-icons/lu";
import DashboardLayout from "../components/DashboardLayout.jsx";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [language, setLanguage] = useState(user?.preferredLanguage || "en");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put("/auth/me", { name, phone, preferredLanguage: language });
      updateUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await api.put("/auth/me/password", { currentPassword, newPassword });
      toast.success("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <p className="vf-eyebrow mb-1">Account</p>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 max-w-3xl">
        <form onSubmit={handleProfileSubmit} className="vf-card p-6 space-y-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <LuUser size={17} className="text-volt-500" /> Personal info
          </h3>
          <div>
            <label className="vf-label">Name</label>
            <input className="vf-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="vf-label">Email</label>
            <input className="vf-input opacity-60" value={user?.email} disabled />
          </div>
          <div>
            <label className="vf-label">Phone</label>
            <input className="vf-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="vf-label flex items-center gap-1.5">
              <LuGlobe size={12} /> Preferred language
            </label>
            <select className="vf-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
          <button type="submit" disabled={savingProfile} className="vf-btn-primary w-full">
            {savingProfile ? "Saving…" : "Save changes"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="vf-card p-6 space-y-4 h-fit">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <LuLock size={17} className="text-volt-500" /> Change password
          </h3>
          <div>
            <label className="vf-label">Current password</label>
            <input
              type="password"
              required
              className="vf-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="vf-label">New password</label>
            <input
              type="password"
              required
              minLength={8}
              className="vf-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={savingPassword} className="vf-btn-primary w-full">
            {savingPassword ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
