import * as React from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ScrollRestoration } from "@/components/site/ScrollRestoration";
import { ScrollToTopButton } from "@/components/site/ScrollToTopButton";

const DEFAULT_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663078505054/djMOBCRMZEeiJqUH.jpg";

export function AdminLayout({ children }: React.PropsWithChildren) {
  return (
    <div
      className="min-h-screen bg-black font-body"
      style={{
        backgroundImage: `url(${DEFAULT_BG})`,
        backgroundAttachment: "fixed",
      }}
    >
      <AdminHeader />
      <ScrollRestoration />
      <main className="pt-20">{children}</main>
      <ScrollToTopButton />
    </div>
  );
}
