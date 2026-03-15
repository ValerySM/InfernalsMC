import * as React from "react";
import { Link } from "wouter";
import { useUserSession } from "@/contexts/UserSessionContext";
import { getMyEvents } from "@/api/user";
import { toast } from "sonner";

export default function MemberDashboard() {
  const { user } = useUserSession();
  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        if (user && ["member", "secretary", "admin"].includes(user.role)) {
          const res = await getMyEvents();
          if (res.ok) setEvents(res.data || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return null;

  const isMemberPlus = ["member", "secretary", "admin"].includes(user.role);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-2">
        Welcome, {user.name}
      </h1>
      <p className="text-gray-400 mb-8">
        Role: <span className="text-red-400 uppercase font-bold">{user.role}</span>
      </p>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/profile" className="block bg-black/50 border border-gray-800 p-6 hover:border-red-600 transition-colors">
          <h3 className="text-lg font-heading text-white uppercase mb-1">My Profile</h3>
          <p className="text-sm text-gray-400">View and edit your profile information</p>
        </Link>

        {isMemberPlus && (
          <Link href="/secretary" className="block bg-black/50 border border-gray-800 p-6 hover:border-red-600 transition-colors">
            <h3 className="text-lg font-heading text-white uppercase mb-1">
              {user.role === "secretary" ? "Secretary Panel" : user.role === "admin" ? "Secretary Panel" : "Member Area"}
            </h3>
            <p className="text-sm text-gray-400">
              {["secretary", "admin"].includes(user.role)
                ? "Manage members, groups, and internal events"
                : "View internal events and groups"}
            </p>
          </Link>
        )}
      </div>

      {/* Upcoming member events */}
      {isMemberPlus && (
        <div className="bg-black/50 border border-gray-800 p-6">
          <h2 className="text-xl font-heading text-white uppercase mb-4">Upcoming Internal Events</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((ev: any) => (
                <div key={ev.id} className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-white font-medium">{ev.title}</h3>
                    <p className="text-sm text-gray-400">
                      {ev.date} {ev.time ? `at ${ev.time}` : ""} {ev.location ? `— ${ev.location}` : ""}
                    </p>
                    {ev.targetGroupName && (
                      <span className="text-xs text-red-400">Group: {ev.targetGroupName}</span>
                    )}
                  </div>
                  <span className={`text-xs uppercase px-2 py-1 ${ev.eventType === "public" ? "bg-green-900/30 text-green-400" : "bg-blue-900/30 text-blue-400"}`}>
                    {ev.eventType}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {user.role === "observer" && (
        <div className="bg-black/50 border border-gray-800 p-6">
          <h2 className="text-xl font-heading text-white uppercase mb-4">Observer Status</h2>
          <p className="text-gray-400">
            As an observer, you will receive email notifications about public events
            {user.emailConsent ? " (email notifications enabled)" : " (email notifications disabled — update in profile)"}.
          </p>
        </div>
      )}
    </div>
  );
}
