import * as React from "react";
import { useUserSession } from "@/contexts/UserSessionContext";
import { updateMyProfile, changePassword } from "@/api/user";
import { toast } from "sonner";

export default function UserProfile() {
  const { user, refresh } = useUserSession();
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    additionalInfo: "",
    emailConsent: false,
  });
  const [saving, setSaving] = React.useState(false);

  // Password change
  const [pwForm, setPwForm] = React.useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        notes: user.notes || "",
        additionalInfo: user.additionalInfo || "",
        emailConsent: user.emailConsent || false,
      });
    }
  }, [user]);

  if (!user) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile(form);
      await refresh();
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(pwForm.current, pwForm.newPw);
      toast.success("Password changed!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-8">My Profile</h1>

      {/* Profile info */}
      <div className="bg-black/50 border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-heading text-white uppercase mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email (read-only)</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-black/30 border border-gray-800 text-gray-500 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              rows={2}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none resize-none"
              placeholder="Any notes..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Additional Info</label>
            <textarea
              value={form.additionalInfo}
              onChange={e => setForm(p => ({ ...p, additionalInfo: e.target.value }))}
              rows={2}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none resize-none"
              placeholder="Bike model, interests, etc."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.emailConsent}
              onChange={e => setForm(p => ({ ...p, emailConsent: e.target.checked }))}
              className="accent-red-500"
            />
            <span className="text-sm text-gray-400">Receive email notifications about events</span>
          </label>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Role: <span className="text-red-400 uppercase">{user.role}</span></span>
            <span className="text-sm text-gray-500">Member since: {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase px-6 py-2 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-black/50 border border-gray-800 p-6">
        <h2 className="text-xl font-heading text-white uppercase mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password</label>
            <input
              type="password"
              required
              value={pwForm.newPw}
              onChange={e => setPwForm(p => ({ ...p, newPw: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={pwSaving}
            className="bg-gray-700 hover:bg-gray-600 text-white font-heading uppercase px-6 py-2 transition-colors disabled:opacity-50"
          >
            {pwSaving ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
