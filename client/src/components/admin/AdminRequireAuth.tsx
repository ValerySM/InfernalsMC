import * as React from "react";
import { useLocation } from "wouter";
import { useAdminSession } from "@/contexts/AdminSessionContext";

export function AdminRequireAuth({ children }: React.PropsWithChildren) {
  const { user, loading, refresh } = useAdminSession();
  const [location, setLocation] = useLocation();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refresh();
      } finally {
        if (mounted) setChecked(true);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!checked) return;
    if (!user && !loading) {
      // preserve desired destination
      const next = encodeURIComponent(location);
      setLocation(`/admin/login?next=${next}`);
    }
  }, [checked, user, loading, location, setLocation]);

  if (!checked || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="border-2 border-gray-700 bg-black/30 p-6 text-center text-gray-300">
          Loading…
        </div>
      </div>
    );
  }

  if (!user) return null;
  return <>{children}</>;
}
