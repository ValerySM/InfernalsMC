import * as React from "react";
import { Link, useLocation } from "wouter";
import { loginUser } from "@/api/user";
import { useUserSession } from "@/contexts/UserSessionContext";
import { toast } from "sonner";

export default function UserLogin() {
  const [, navigate] = useLocation();
  const { refresh } = useUserSession();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setPendingMessage(null);
    try {
      const res = await loginUser(email, password);
      if (res.ok) {
        await refresh();
        toast.success("Welcome back!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.code;
      const msg = err?.response?.data?.error?.message || "Login failed.";
      if (code === "PENDING_APPROVAL") {
        setPendingMessage(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-black/50 border border-gray-800 p-8">
          <h1 className="text-2xl font-heading font-bold text-white uppercase mb-6 text-center">
            Login
          </h1>

          {pendingMessage && (
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-sm">
              {pendingMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-red-400 transition-colors">
              Forgot password?
            </Link>
            <div className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/register" className="text-red-400 hover:text-red-300 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
