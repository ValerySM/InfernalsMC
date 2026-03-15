import * as React from "react";
import { Link, useLocation } from "wouter";
import { Menu, User, LogOut } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/hooks/usePublicContent";
import { useUserSession } from "@/contexts/UserSessionContext";

export type NavItem = {
  label: string;
  href: string;
};

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Trainings", href: "/trainings" },
  { label: "Art Studio", href: "/art-studio" },
  { label: "Activities", href: "/activities" },
  { label: "Organized", href: "/organized" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/#contact" },
];

function isActivePath(current: string, href: string) {
  const target = href.split("#")[0];
  if (target === "/") return current === "/";
  return current.startsWith(target);
}

export function SiteHeader() {
  const [location, navigate] = useLocation();
  const { get } = useSiteContent();
  const { user, loading, logout } = useUserSession();

  const clubNameShort = get("club_name_short", "Infernals MC");
  const clubCountry = get("club_country", "Israel");
  const clubNameFull = get("club_name", "Infernals MC Israel");

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-40 shadow-lg shadow-red-500/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-heading font-bold text-white uppercase">
            {clubNameShort}
          </span>
          <span className="text-2xl font-heading font-bold text-red-500 uppercase">
            {clubCountry}
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "font-heading uppercase tracking-wide text-gray-300 hover:text-red-500 transition-colors duration-300",
                isActivePath(location, item.href) && "text-red-500"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Auth buttons */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-700">
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-1.5 font-heading uppercase tracking-wide text-gray-300 hover:text-red-500 transition-colors duration-300",
                      (location === "/dashboard" || location === "/profile" || location === "/secretary") && "text-red-500"
                    )}
                  >
                    <User className="size-4" />
                    {user.name.split(" ")[0]}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-700">
                  <Link
                    href="/login"
                    className={cn(
                      "font-heading uppercase tracking-wide text-gray-300 hover:text-red-500 transition-colors duration-300",
                      location === "/login" && "text-red-500"
                    )}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="font-heading uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white px-3 py-1 transition-colors duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex items-center justify-center size-10 border border-gray-700 bg-black/40 hover:bg-black/60 text-gray-200"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="border-r border-gray-800">
              <SheetHeader>
                <SheetTitle className="font-heading uppercase text-red-500">
                  {clubNameFull}
                </SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6 flex flex-col gap-2">
                {NAV.map(item => (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200",
                        isActivePath(location, item.href) &&
                          "border-red-500/50 text-red-400"
                      )}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                {/* Mobile auth */}
                <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
                  {!loading && user ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200 flex items-center gap-2"
                        >
                          <User className="size-4" /> Dashboard
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200"
                        >
                          My Profile
                        </Link>
                      </SheetClose>
                      {["member", "secretary", "admin"].includes(user.role) && (
                        <SheetClose asChild>
                          <Link
                            href="/secretary"
                            className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200"
                          >
                            {["secretary", "admin"].includes(user.role) ? "Secretary Panel" : "Member Area"}
                          </Link>
                        </SheetClose>
                      )}
                      <SheetClose asChild>
                        <button
                          onClick={handleLogout}
                          className="py-3 px-3 border border-red-800 bg-red-900/20 hover:bg-red-900/40 font-heading uppercase text-red-400 text-left"
                        >
                          Logout
                        </button>
                      </SheetClose>
                    </>
                  ) : !loading ? (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="py-3 px-3 border border-gray-800 bg-black/30 hover:bg-black/50 font-heading uppercase text-gray-200"
                        >
                          Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/register"
                          className="py-3 px-3 border border-red-800 bg-red-900/30 hover:bg-red-900/50 font-heading uppercase text-red-400"
                        >
                          Register
                        </Link>
                      </SheetClose>
                    </>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
