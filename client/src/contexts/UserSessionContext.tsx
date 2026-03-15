import * as React from "react";
import { getMe, logoutUser } from "@/api/user";

export type SiteUser = {
  id: string;
  name: string;
  email: string;
  role: "pending" | "observer" | "member" | "secretary" | "admin";
  status: string;
  emailConsent: boolean;
  phone: string | null;
  address: string | null;
  notes: string | null;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserSessionState = {
  user: SiteUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserSessionContext = React.createContext<UserSessionState>({
  user: null,
  loading: true,
  error: null,
  refresh: async () => {},
  logout: async () => {},
});

export function UserSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SiteUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMe();
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <UserSessionContext.Provider value={{ user, loading, error, refresh, logout }}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  return React.useContext(UserSessionContext);
}
