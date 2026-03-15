import * as React from "react";
import { Link } from "wouter";
import { forgotPassword, resetPassword } from "@/api/user";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [step, setStep] = React.useState<"email" | "token">("email");
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("If this email is registered, a reset token has been generated. Check server console.");
      setStep("token");
    } catch {
      toast.error("Failed to process request.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, newPassword);
      if (res.ok) {
        setDone(true);
        toast.success("Password reset successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-black/50 border border-gray-800 p-8 text-center">
          <h1 className="text-2xl font-heading font-bold text-white uppercase mb-4">Password Reset</h1>
          <p className="text-gray-400 mb-6">Your password has been reset successfully.</p>
          <Link href="/login" className="inline-block bg-red-600 hover:bg-red-700 text-white font-heading uppercase px-6 py-2 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-black/50 border border-gray-800 p-8">
        <h1 className="text-2xl font-heading font-bold text-white uppercase mb-6 text-center">
          {step === "email" ? "Forgot Password" : "Reset Password"}
        </h1>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase py-2.5 transition-colors disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Token"}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep("token")} className="text-sm text-gray-400 hover:text-red-400">
                I already have a token
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Reset Token</label>
              <input
                type="text"
                required
                value={token}
                onChange={e => setToken(e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="Paste token from email"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase py-2.5 transition-colors disabled:opacity-50">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
