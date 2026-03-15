import * as React from "react";
import { useSiteContent } from "@/hooks/usePublicContent";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollToTopButton } from "@/components/site/ScrollToTopButton";
import { ScrollRestoration } from "@/components/site/ScrollRestoration";

const DEFAULT_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/djMOBCRMZEeiJqUH.jpg";

export function SiteLayout({ children }: React.PropsWithChildren) {
  const { get } = useSiteContent();
  const bgUrl = get("background_texture_url", DEFAULT_BG);

  return (
    <div
      className="min-h-screen bg-black font-body"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundAttachment: "fixed",
      }}
    >
      <SiteHeader />
      <ScrollRestoration />
      <main className="pt-20">{children}</main>
      <SiteFooter />
      <ScrollToTopButton />
    </div>
  );
}
