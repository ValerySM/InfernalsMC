import * as React from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { club } from "@/site/content";

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
  // strip hash
  const target = href.split("#")[0];
  if (target === "/") return current === "/";
  return current.startsWith(target);
}

export function SiteHeader() {
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-40 shadow-lg shadow-red-500/10">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-heading font-bold text-white uppercase">
            {club.nameShort}
          </span>
          <span className="text-2xl font-heading font-bold text-red-500 uppercase">
            {club.country}
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
                  {club.name}
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
