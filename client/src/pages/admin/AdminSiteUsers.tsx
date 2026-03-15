import * as React from "react";
import { getSiteUsers, getSiteUserCounts, updateSiteUser, resetSiteUserPassword, deleteSiteUser } from "@/api/user";
import { toast } from "sonner";

export default function AdminSiteUsers() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [counts, setCounts] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editRole, setEditRole] = React.useState("");
  const [editStatus, setEditStatus] = React.useState("");
  const [resetPwId, setResetPwId] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState("");

  React.useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) params.status = filter;
      const [uRes, cRes] = await Promise.all([getSiteUsers(params), getSiteUserCounts()]);
      if (uRes.ok) setUsers(uRes.data || []);
      if (cRes.ok) setCounts(cRes.data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(u: any) {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditStatus(u.status);
  }

  async function saveEdit(id: string) {
    try {
      await updateSiteUser(id, { role: editRole, status: editStatus });
      toast.success("User updated!");
      setEditingId(null);
      loadData();
    } catch {
      toast.error("Failed to update.");
    }
  }

  async function handleResetPw() {
    if (!resetPwId || !newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    try {
      await resetSiteUserPassword(resetPwId, newPassword);
      toast.success("Password reset!");
      setResetPwId(null);
      setNewPassword("");
    } catch {
      toast.error("Failed.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteSiteUser(id);
      toast.success("User deleted.");
      loadData();
    } catch {
      toast.error("Failed to delete.");
    }
  }

  const STATUSES = [
    { value: "", label: "All" },
    { value: "active", label: `Active${counts ? ` (${counts.active})` : ""}` },
    { value: "pending_approval", label: `Pending${counts ? ` (${counts.pending})` : ""}` },
    { value: "rejected", label: `Rejected${counts ? ` (${counts.rejected})` : ""}` },
    { value: "deactivated", label: `Deactivated${counts ? ` (${counts.deactivated})` : ""}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-6">
        Site Users {counts && <span className="text-base text-gray-400">({counts.total} total)</span>}
      </h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1 text-sm ${filter === s.value ? "bg-red-600 text-white" : "bg-black/50 border border-gray-700 text-gray-400 hover:text-white"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Reset password modal */}
      {resetPwId && (
        <div className="bg-black/50 border border-gray-700 p-4 mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-400">New password:</span>
          <input
            type="text"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="bg-black/60 border border-gray-700 text-white px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
            placeholder="Min 6 chars"
          />
          <button onClick={handleResetPw} className="bg-red-600 text-white text-sm px-3 py-1">Reset</button>
          <button onClick={() => { setResetPwId(null); setNewPassword(""); }} className="text-gray-400 text-sm">Cancel</button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Joined</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-2 px-3 text-white">{u.name}</td>
                  <td className="py-2 px-3 text-gray-400">{u.email}</td>
                  <td className="py-2 px-3">
                    {editingId === u.id ? (
                      <select value={editRole} onChange={e => setEditRole(e.target.value)}
                        className="bg-black/60 border border-gray-700 text-white px-1 py-0.5 text-xs">
                        <option value="observer">Observer</option>
                        <option value="member">Member</option>
                        <option value="secretary">Secretary</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`text-xs uppercase px-2 py-0.5 ${
                        u.role === "admin" ? "bg-red-900/30 text-red-400" :
                        u.role === "secretary" ? "bg-yellow-900/30 text-yellow-400" :
                        u.role === "member" ? "bg-blue-900/30 text-blue-400" :
                        "bg-gray-800 text-gray-400"
                      }`}>{u.role}</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {editingId === u.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        className="bg-black/60 border border-gray-700 text-white px-1 py-0.5 text-xs">
                        <option value="active">Active</option>
                        <option value="pending_approval">Pending</option>
                        <option value="rejected">Rejected</option>
                        <option value="deactivated">Deactivated</option>
                      </select>
                    ) : (
                      <span className={`text-xs uppercase px-2 py-0.5 ${
                        u.status === "active" ? "bg-green-900/30 text-green-400" :
                        u.status === "pending_approval" ? "bg-yellow-900/30 text-yellow-400" :
                        "bg-red-900/30 text-red-400"
                      }`}>{u.status}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-3">
                    {editingId === u.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => saveEdit(u.id)} className="text-green-400 hover:text-green-300 text-xs">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-white text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(u)} className="text-gray-400 hover:text-white text-xs">Edit</button>
                        <button onClick={() => setResetPwId(u.id)} className="text-yellow-400 hover:text-yellow-300 text-xs">Reset PW</button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
