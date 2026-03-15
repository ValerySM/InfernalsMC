import * as React from "react";
import { useUserSession } from "@/contexts/UserSessionContext";
import SecretaryMembers from "./secretary/SecretaryMembers";
import SecretaryGroups from "./secretary/SecretaryGroups";
import SecretaryEvents from "./secretary/SecretaryEvents";
import SecretaryEmail from "./secretary/SecretaryEmail";
import { getSecretaryStats } from "@/api/user";

const TABS = [
  { id: "members", label: "Members" },
  { id: "groups", label: "Groups" },
  { id: "events", label: "Internal Events" },
  { id: "email", label: "Send Email" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SecretaryDashboard() {
  const { user } = useUserSession();
  const [tab, setTab] = React.useState<TabId>("members");
  const [stats, setStats] = React.useState<any>(null);

  const isSecretary = user && ["secretary", "admin"].includes(user.role);

  React.useEffect(() => {
    if (isSecretary) {
      getSecretaryStats().then(r => { if (r.ok) setStats(r.data); }).catch(() => {});
    }
  }, [isSecretary]);

  if (!user) return null;

  if (!["member", "secretary", "admin"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-heading text-white uppercase mb-4">Access Denied</h1>
        <p className="text-gray-400">This area is for club members only.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-heading font-bold text-white uppercase mb-2">
        {isSecretary ? "Secretary Panel" : "Member Area"}
      </h1>

      {stats && isSecretary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black/50 border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.memberCount}</div>
            <div className="text-xs text-gray-400 uppercase">Active Members</div>
          </div>
          <div className="bg-black/50 border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.groupCount}</div>
            <div className="text-xs text-gray-400 uppercase">Groups</div>
          </div>
          <div className="bg-black/50 border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.eventCount}</div>
            <div className="text-xs text-gray-400 uppercase">Internal Events</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {isSecretary && (
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-800">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-heading uppercase transition-colors ${
                tab === t.id
                  ? "text-red-400 border-b-2 border-red-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      <div className="transition-opacity duration-200">
        {isSecretary ? (
          <>
            {tab === "members" && <SecretaryMembers />}
            {tab === "groups" && <SecretaryGroups />}
            {tab === "events" && <SecretaryEvents />}
            {tab === "email" && <SecretaryEmail />}
          </>
        ) : (
          <SecretaryEvents memberOnly />
        )}
      </div>
    </div>
  );
}
