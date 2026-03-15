import * as React from "react";
import { getAdminNotifications, markNotifRead, markAllNotifsRead } from "@/api/user";
import { toast } from "sonner";

export default function AdminNotifications() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAdminNotifications();
      if (res.ok) setNotifications(res.data || []);
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotifRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error("Failed.");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotifsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All marked as read.");
    } catch {
      toast.error("Failed.");
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-white uppercase">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-3 text-base bg-red-600 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`p-4 border transition-colors ${
                n.isRead
                  ? "bg-black/30 border-gray-800/50"
                  : "bg-black/50 border-gray-700 hover:border-red-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />}
                    <h3 className={`font-medium ${n.isRead ? "text-gray-400" : "text-white"}`}>{n.title}</h3>
                  </div>
                  {n.message && <p className="text-sm text-gray-500 mt-1">{n.message}</p>}
                  <p className="text-xs text-gray-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
