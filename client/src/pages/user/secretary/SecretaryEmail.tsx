import * as React from "react";
import { getGroups, sendGroupEmail } from "@/api/user";
import { toast } from "sonner";

export default function SecretaryEmail() {
  const [groups, setGroups] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    subject: "",
    body: "",
    targetGroupId: "",
    sendToObservers: false,
  });
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    getGroups().then(r => { if (r.ok) setGroups(r.data || []); }).catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject || !form.body) {
      toast.error("Subject and body are required.");
      return;
    }
    if (!form.targetGroupId && !form.sendToObservers) {
      toast.error("Select a group or enable 'Send to observers'.");
      return;
    }
    setSending(true);
    try {
      const res = await sendGroupEmail(form);
      if (res.ok) {
        toast.success(`Email sent to ${res.data.sent} recipients!`);
        setForm({ subject: "", body: "", targetGroupId: "", sendToObservers: false });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="text-xl font-heading text-white uppercase mb-4">Send Email</h2>

      <form onSubmit={handleSend} className="bg-black/50 border border-gray-800 p-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Recipients</label>
          <div className="space-y-2">
            <select
              value={form.targetGroupId}
              onChange={e => setForm(p => ({ ...p, targetGroupId: e.target.value }))}
              className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            >
              <option value="">No specific group</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name} ({g.memberCount} members)</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sendToObservers}
                onChange={e => setForm(p => ({ ...p, sendToObservers: e.target.checked }))}
                className="accent-red-500"
              />
              <span className="text-sm text-gray-400">Also send to all observers with email consent</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Subject</label>
          <input
            type="text"
            value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            placeholder="Email subject..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Body</label>
          <textarea
            value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
            rows={6}
            className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none resize-none"
            placeholder="Email body..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className="bg-red-600 hover:bg-red-700 text-white font-heading uppercase px-6 py-2 transition-colors disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
          <span className="text-xs text-gray-500">
            Note: Emails are currently logged to server console. Configure SMTP for real delivery.
          </span>
        </div>
      </form>
    </div>
  );
}
