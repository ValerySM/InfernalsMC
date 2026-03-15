import * as React from "react";
import { adminLogin, adminLogout, adminMe, type AdminUser } from "@/api/admin";

type AdminSessionState = {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = React.createContext<AdminSessionState | null>(null);

export function AdminSessionProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = React.useState<AdminUser | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await adminMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await adminLogin(email, password);
      setUser(u);
    } catch (e: any) {
      setUser(null);
      setError(e?.message || "Login failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await adminLogout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, error, refresh, login, logout }),
    [user, loading, error, refresh, login, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSession() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return v;
}
