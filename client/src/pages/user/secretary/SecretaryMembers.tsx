import * as React from "react";
import { getSecretaryMembers } from "@/api/user";
import { toast } from "sonner";

export default function SecretaryMembers() {
  const [members, setMembers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    try {
      const res = await getSecretaryMembers();
      if (res.ok) setMembers(res.data || []);
    } catch {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading text-white uppercase">Active Members</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-black/60 border border-gray-700 text-white px-3 py-1.5 text-sm focus:border-red-500 focus:outline-none w-48"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m: any) => (
                <tr key={m.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-2 px-3 text-white">{m.name}</td>
                  <td className="py-2 px-3 text-gray-400">{m.email}</td>
                  <td className="py-2 px-3">
                    <span className={`text-xs uppercase px-2 py-0.5 ${
                      m.role === "admin" ? "bg-red-900/30 text-red-400" :
                      m.role === "secretary" ? "bg-yellow-900/30 text-yellow-400" :
                      "bg-blue-900/30 text-blue-400"
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-400">{m.phone || "—"}</td>
                  <td className="py-2 px-3 text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
