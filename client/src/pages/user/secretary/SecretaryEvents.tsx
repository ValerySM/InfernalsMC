import * as React from "react";
import {
  getMemberEvents, createMemberEvent, updateMemberEvent, deleteMemberEvent,
  getGroups, getMyEvents,
} from "@/api/user";
import { toast } from "sonner";

type Props = { memberOnly?: boolean };

export default function SecretaryEvents({ memberOnly }: Props) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    title: "", description: "", eventType: "member" as string,
    date: "", time: "", location: "", targetGroupId: "",
  });

  React.useEffect(() => {
    loadData();
  }, [memberOnly]);

  async function loadData() {
    setLoading(true);
    try {
      if (memberOnly) {
        const res = await getMyEvents();
        if (res.ok) setEvents(res.data || []);
      } else {
        const [eRes, gRes] = await Promise.all([getMemberEvents(), getGroups()]);
        if (eRes.ok) setEvents(eRes.data || []);
        if (gRes.ok) setGroups(gRes.data || []);
      }
    } catch {
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", eventType: "member", date: "", time: "", location: "", targetGroupId: "" });
    setEditId(null);
    setShowCreate(false);
  }

  function startEdit(ev: any) {
    setForm({
      title: ev.title || "",
      description: ev.description || "",
      eventType: ev.eventType || "member",
      date: ev.date?.split("T")[0] || "",
      time: ev.time || "",
      location: ev.location || "",
      targetGroupId: ev.targetGroupId || "",
    });
    setEditId(ev.id);
    setShowCreate(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) {
      toast.error("Title and date are required.");
      return;
    }
    try {
      if (editId) {
        await updateMemberEvent(editId, form);
        toast.success("Event updated!");
      } else {
        await createMemberEvent(form);
        toast.success("Event created!");
      }
      resetForm();
      loadData();
    } catch {
      toast.error("Failed to save event.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    try {
      await deleteMemberEvent(id);
      toast.success("Event deleted.");
      loadData();
    } catch {
      toast.error("Failed to delete.");
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading text-white uppercase">
          {memberOnly ? "My Events" : "Internal Events"}
        </h2>
        {!memberOnly && (
          <button
            onClick={() => { if (showCreate) resetForm(); else setShowCreate(true); }}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 font-heading uppercase transition-colors"
          >
            {showCreate ? "Cancel" : "+ New Event"}
          </button>
        )}
      </div>

      {showCreate && !memberOnly && (
        <form onSubmit={handleSubmit} className="bg-black/50 border border-gray-800 p-4 mb-4 space-y-3 transition-all duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
            <select
              value={form.eventType}
              onChange={e => setForm(p => ({ ...p, eventType: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            >
              <option value="member">Member Only</option>
              <option value="public">Public</option>
            </select>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
            <input
              type="time"
              value={form.time}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            />
            <select
              value={form.targetGroupId}
              onChange={e => setForm(p => ({ ...p, targetGroupId: e.target.value }))}
              className="bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
            >
              <option value="">All members (no group)</option>
              {groups.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none resize-none"
          />
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 font-heading uppercase">
            {editId ? "Update Event" : "Create Event"}
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p className="text-gray-500">No events yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((ev: any) => (
            <div key={ev.id} className="bg-black/50 border border-gray-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-medium">{ev.title}</h3>
                  <p className="text-sm text-gray-400">
                    {ev.date?.split("T")[0]} {ev.time ? `at ${ev.time}` : ""} {ev.location ? `— ${ev.location}` : ""}
                  </p>
                  {ev.description && <p className="text-sm text-gray-500 mt-1">{ev.description}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs uppercase px-2 py-0.5 ${
                      ev.eventType === "public" ? "bg-green-900/30 text-green-400" : "bg-blue-900/30 text-blue-400"
                    }`}>
                      {ev.eventType}
                    </span>
                    {ev.targetGroupName && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5">
                        Group: {ev.targetGroupName}
                      </span>
                    )}
                  </div>
                </div>
                {!memberOnly && (
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(ev)} className="text-gray-400 hover:text-white text-sm">Edit</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
