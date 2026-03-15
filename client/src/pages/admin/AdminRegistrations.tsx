import * as React from "react";
import { getPendingRegistrations, getAllRegistrations, decideRegistration } from "@/api/user";
import { toast } from "sonner";

export default function AdminRegistrations() {
  const [pending, setPending] = React.useState<any[]>([]);
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"pending" | "history">("pending");
  const [decidingId, setDecidingId] = React.useState<string | null>(null);
  const [assignRole, setAssignRole] = React.useState<string>("observer");

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pRes, hRes] = await Promise.all([getPendingRegistrations(), getAllRegistrations()]);
      if (pRes.ok) setPending(pRes.data || []);
      if (hRes.ok) setHistory(hRes.data || []);
    } catch {
      toast.error("Failed to load registrations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecide(id: string, decision: "approved" | "rejected") {
    try {
      await decideRegistration(id, {
        decision,
        assignedRole: decision === "approved" ? assignRole : undefined,
      });
      toast.success(decision === "approved" ? "User approved!" : "Registration rejected.");
      setDecidingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Action failed.");
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-6">Registrations</h1>

      <div className="flex gap-4 mb-6 border-b border-gray-800">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 text-sm font-heading uppercase ${tab === "pending" ? "text-red-400 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-4 py-2 text-sm font-heading uppercase ${tab === "history" ? "text-red-400 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
        >
          History
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : tab === "pending" ? (
        pending.length === 0 ? (
          <p className="text-gray-500">No pending registrations.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((r: any) => (
              <div key={r.id} className="bg-black/50 border border-gray-800 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium text-lg">{r.userName}</h3>
                    <p className="text-sm text-gray-400">{r.userEmail}</p>
                    {r.reasonForRegistration && (
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="text-gray-400">Reason:</span> {r.reasonForRegistration}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">
                      Registered: {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {decidingId === r.id ? (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-black/30 border border-gray-700">
                    <label className="text-sm text-gray-400">Assign role:</label>
                    <select
                      value={assignRole}
                      onChange={e => setAssignRole(e.target.value)}
                      className="bg-black/60 border border-gray-700 text-white px-2 py-1 text-sm focus:border-red-500 focus:outline-none"
                    >
                      <option value="observer">Observer</option>
                      <option value="member">Member</option>
                      <option value="secretary">Secretary</option>
                    </select>
                    <button
                      onClick={() => handleDecide(r.id, "approved")}
                      className="bg-green-700 hover:bg-green-600 text-white text-sm px-3 py-1"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecide(r.id, "rejected")}
                      className="bg-red-700 hover:bg-red-600 text-white text-sm px-3 py-1"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setDecidingId(null)}
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <button
                      onClick={() => { setDecidingId(r.id); setAssignRole("observer"); }}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 font-heading uppercase"
                    >
                      Review
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        history.length === 0 ? (
          <p className="text-gray-500">No registration history.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="py-2 px-3">User</th>
                  <th className="py-2 px-3">Email</th>
                  <th className="py-2 px-3">Decision</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-800/50">
                    <td className="py-2 px-3 text-white">{r.userName}</td>
                    <td className="py-2 px-3 text-gray-400">{r.userEmail}</td>
                    <td className="py-2 px-3">
                      {r.adminDecision ? (
                        <span className={`text-xs uppercase px-2 py-0.5 ${
                          r.adminDecision === "approved" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                        }`}>
                          {r.adminDecision}
                        </span>
                      ) : (
                        <span className="text-xs uppercase px-2 py-0.5 bg-yellow-900/30 text-yellow-400">Pending</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-400">{r.assignedRole || "—"}</td>
                    <td className="py-2 px-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
