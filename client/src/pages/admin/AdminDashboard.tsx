import * as React from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminListEvents,
  adminListGallery,
  adminListMembers,
  adminListArtProjects,
  adminListSupportMethods,
} from "@/api/admin";
import {
  getPendingRegistrations,
  getAdminNotifications,
  getSiteUserCounts,
} from "@/api/user";
import { useAdminSession } from "@/contexts/AdminSessionContext";

export default function AdminDashboard() {
  const { user } = useAdminSession();
  const [eventsCount, setEventsCount] = React.useState<number | null>(null);
  const [galleryCount, setGalleryCount] = React.useState<number | null>(null);
  const [membersCount, setMembersCount] = React.useState<number | null>(null);
  const [artCount, setArtCount] = React.useState<number | null>(null);
  const [supportCount, setSupportCount] = React.useState<number | null>(null);
  const [pendingCount, setPendingCount] = React.useState<number | null>(null);
  const [unreadNotifs, setUnreadNotifs] = React.useState<number | null>(null);
  const [siteUserTotal, setSiteUserTotal] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [events, gallery, members, art, support] = await Promise.all([
          adminListEvents(),
          adminListGallery(),
          adminListMembers(),
          adminListArtProjects(),
          adminListSupportMethods(),
        ]);
        if (!mounted) return;
        setEventsCount(events.length);
        setGalleryCount(gallery.length);
        setMembersCount(members.length);
        setArtCount(art.length);
        setSupportCount(support.length);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load dashboard");
      }

      // Load user system stats (may fail if tables don't exist yet)
      try {
        const [pendingRes, notifsRes, countsRes] = await Promise.all([
          getPendingRegistrations(),
          getAdminNotifications(),
          getSiteUserCounts(),
        ]);
        if (!mounted) return;
        if (pendingRes.ok) setPendingCount((pendingRes.data || []).length);
        if (notifsRes.ok) setUnreadNotifs((notifsRes.data || []).filter((n: any) => !n.isRead).length);
        if (countsRes.ok) setSiteUserTotal(countsRes.data?.total || 0);
      } catch {
        // User system not yet initialized — that's ok
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const contentCards = [
    {
      title: "Site Content",
      count: null as number | null,
      countLabel: "Texts & Settings",
      desc: "Edit all homepage texts, contacts, social links, hero image, and page titles.",
      href: "/admin/site-content",
      btnLabel: "Edit Content",
    },
    {
      title: "Members",
      count: membersCount,
      desc: "Manage club officers with photos, names, and roles.",
      href: "/admin/members",
      btnLabel: "Manage Members",
    },
    {
      title: "Events",
      count: eventsCount,
      desc: "Create and edit event pages with photos and videos.",
      href: "/admin/events",
      btnLabel: "Manage Events",
    },
    {
      title: "Gallery",
      count: galleryCount,
      desc: "Upload images or embeds for the homepage gallery.",
      href: "/admin/gallery",
      btnLabel: "Manage Gallery",
    },
    {
      title: "Art Projects",
      count: artCount,
      desc: "Art Studio projects with media galleries.",
      href: "/admin/art-projects",
      btnLabel: "Manage Projects",
    },
    {
      title: "Support Methods",
      count: supportCount,
      desc: "Donation methods with QR codes and links.",
      href: "/admin/support",
      btnLabel: "Manage Support",
    },
  ];

  const userCards = [
    {
      title: "Registrations",
      count: pendingCount,
      countLabel: "Pending",
      desc: "Review and approve/reject new user registrations.",
      href: "/admin/registrations",
      btnLabel: "Review",
      highlight: (pendingCount || 0) > 0,
    },
    {
      title: "Site Users",
      count: siteUserTotal,
      desc: "Manage registered users, change roles, reset passwords.",
      href: "/admin/site-users",
      btnLabel: "Manage Users",
    },
    {
      title: "Notifications",
      count: unreadNotifs,
      countLabel: "Unread",
      desc: "System notifications about registrations and activity.",
      href: "/admin/notifications",
      btnLabel: "View All",
      highlight: (unreadNotifs || 0) > 0,
    },
    {
      title: "Email Logs",
      count: null as number | null,
      countLabel: "History",
      desc: "View all sent emails and their delivery status.",
      href: "/admin/email-logs",
      btnLabel: "View Logs",
    },
    {
      title: "Admin Users",
      count: null as number | null,
      countLabel: "Access Control",
      desc: "Create additional admin users and manage access.",
      href: "/admin/users",
      btnLabel: "Manage Admins",
    },
  ];

  function renderCard(c: any) {
    return (
      <Card key={c.title} className={`border-2 bg-black/30 ${c.highlight ? "border-red-500/60" : "border-gray-700"}`}>
        <CardHeader>
          <CardTitle className="font-heading uppercase text-red-500">
            {c.title}
            {c.highlight && <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">NEW</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-200">
          <div className="text-4xl font-heading">
            {c.count !== null && c.count !== undefined
              ? (c.count ?? "…")
              : c.countLabel || "—"}
          </div>
          <p className="mt-2 text-gray-400">{c.desc}</p>
          <Link
            href={c.href}
            className="mt-4 inline-flex items-center justify-center border border-gray-700 bg-black/30 hover:bg-black/50 px-4 py-2 font-heading uppercase text-gray-200"
          >
            {c.btnLabel}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle={user ? `Signed in as ${user.name} (${user.role})` : ""}
      />

      <div className="container mx-auto px-4 pb-16">
        {err ? (
          <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-4 mb-6">
            {err}
          </div>
        ) : null}

        {/* Content Management */}
        <h2 className="text-xl font-heading uppercase text-white mb-4">Content Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {contentCards.map(renderCard)}
        </div>

        {/* User Management */}
        <h2 className="text-xl font-heading uppercase text-white mb-4">User Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {userCards.map(renderCard)}
        </div>

        <div className="border-2 border-gray-700 bg-black/30 p-6">
          <h2 className="font-heading uppercase text-xl text-white">Quick Tips</h2>
          <ul className="mt-3 list-disc list-inside text-gray-300 space-y-2">
            <li>
              <strong>Site Content</strong> — edit all texts, hero image, contacts, and social links in one place.
            </li>
            <li>
              <strong>Registrations</strong> — new users register on the site and wait for your approval. You assign their role (Observer, Member, Secretary).
            </li>
            <li>
              <strong>Site Users</strong> — manage all registered users, change roles, deactivate accounts, reset passwords.
            </li>
            <li>
              <strong>Members</strong> — add club officers with photos. They appear on the homepage.
            </li>
            <li>
              After uploading media, copy the public event link and share it.
            </li>
            <li>
              Keep event slugs stable (changing a slug changes the URL).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
