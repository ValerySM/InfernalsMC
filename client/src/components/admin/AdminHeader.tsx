import * as React from "react";
import { Link, useLocation } from "wouter";
import { Menu, LogOut, Bell } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAdminSession } from "@/contexts/AdminSessionContext";
import { getAdminNotifications } from "@/api/user";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Site Content", href: "/admin/site-content" },
  { label: "Members", href: "/admin/members" },
  { label: "Events", href: "/admin/events" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Art Projects", href: "/admin/art-projects" },
  { label: "Support", href: "/admin/support" },
  { label: "Admin Users", href: "/admin/users" },
  { label: "Site Users", href: "/admin/site-users" },
  { label: "Registrations", href: "/admin/registrations" },
  { label: "Email Logs", href: "/admin/email-logs" },
];

function isActive(current: string, href: string) {
  if (href === "/admin") return current === "/admin";
  return current.startsWith(href);
}

export function AdminHeader() {
  const [location] = useLocation();
  const { user, logout } = useAdminSession();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      getAdminNotifications()
        .then(res => {
          if (res.ok) {
            const unread = (res.data || []).filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => {});
    }
  }, [user, location]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-40 shadow-lg shadow-red-500/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="text-2xl font-heading font-bold text-white uppercase">
            Infernals MC
          </span>
          <span className="text-2xl font-heading font-bold text-red-500 uppercase">ADMIN</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden xl:flex items-center gap-3">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-heading uppercase tracking-wide text-xs text-gray-300 hover:text-red-500 transition-colors duration-300",
                isActive(location, item.href) && "text-red-500"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Notifications bell */}
          <Link
            href="/admin/notifications"
            className={cn(
              "relative font-heading uppercase tracking-wide text-xs text-gray-300 hover:text-red-500 transition-colors duration-300",
              isActive(location, "/admin/notifications") && "text-red-500"
            )}
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/"
            className="font-heading uppercase tracking-wide text-xs text-gray-300 hover:text-white transition-colors duration-300"
          >
            Public Site
          </Link>
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 border border-gray-700 bg-black/30 hover:bg-black/50 px-3 py-2 font-heading uppercase text-gray-200 text-xs"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          ) : null}
        </nav>

        {/* Mobile */}
        <div className="xl:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open admin menu"
                className="inline-flex items-center justify-center size-10 border border-gray-700 bg-black/40 hover:bg-black/60 text-gray-200"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r border-gray-800">
              <SheetHeader>
                <SheetTitle className="font-heading uppercase text-red-500">Admin</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6 flex flex-col gap-2">
                {NAV.map(item => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200",
                        isActive(location, item.href) && "border-red-500/50 text-red-400"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/admin/notifications"
                    className={cn(
                      "py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200 flex items-center gap-2",
                      isActive(location, "/admin/notifications") && "border-red-500/50 text-red-400"
                    )}
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                    )}
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200"
                  >
                    Public Site
                  </Link>
                </SheetClose>
                {user ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200 text-left"
                  >
                    Sign out
                  </button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
