import * as React from "react";
import { cdnUrls } from "@/site/content";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScrollToTopButton } from "@/components/site/ScrollToTopButton";
import { ScrollRestoration } from "@/components/site/ScrollRestoration";

export function SiteLayout({ children }: React.PropsWithChildren) {
  return (
    <div
      className="min-h-screen bg-black font-body"
      style={{
        backgroundImage: `url(${cdnUrls.steelTextureBg})`,
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
