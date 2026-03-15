import * as React from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@/components/site/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/contexts/AdminSessionContext";

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}


export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { user, login, loading, error, refresh } = useAdminSession();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    refresh().catch(() => void 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (user) {
      const next = new URLSearchParams(window.location.search).get("next");
      const decoded = next ? safeDecodeURIComponent(next) : null;
      setLocation(decoded || "/admin");
    }
  }, [user, setLocation]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next");
      const decoded = next ? safeDecodeURIComponent(next) : null;
      setLocation(decoded || "/admin");
    } catch (err: any) {
      setLocalError(err?.message || "Login failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Login"
        subtitle="Sign in to manage events, photos, and admin users."
      />

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-lg mx-auto border-2 border-gray-700 bg-black/30 p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block font-heading uppercase text-gray-300 mb-2">Email</label>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourclub.com"
                className="bg-black/40 border-gray-700 text-gray-200"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block font-heading uppercase text-gray-300 mb-2">Password</label>
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="bg-black/40 border-gray-700 text-gray-200"
                autoComplete="current-password"
              />
            </div>

            {(localError || error) ? (
              <div className="border border-red-500/40 bg-red-500/10 text-red-200 p-3 text-sm">
                {localError || error}
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <p className="text-gray-500 text-sm text-center">
              First login credentials are configured on the server (.env).
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}