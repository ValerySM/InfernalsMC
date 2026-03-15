import * as React from "react";
import { getEmailLogs } from "@/api/user";
import { toast } from "sonner";

export default function AdminEmailLogs() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getEmailLogs(200, 0);
      if (res.ok) {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error("Failed to load email logs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-6">
        Email Logs <span className="text-base text-gray-400">({total} total)</span>
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No emails sent yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="py-2 px-3">Recipient</th>
                <th className="py-2 px-3">Subject</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-2 px-3">
                    <span className="text-white">{log.recipientName || log.recipientEmail}</span>
                    {log.recipientName && <span className="text-gray-500 text-xs ml-1">({log.recipientEmail})</span>}
                  </td>
                  <td className="py-2 px-3 text-gray-300 max-w-xs truncate">{log.subject}</td>
                  <td className="py-2 px-3">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5">{log.sendType}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-xs uppercase px-2 py-0.5 ${
                      log.sendStatus === "sent" ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                    }`}>
                      {log.sendStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500">{new Date(log.sentAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
