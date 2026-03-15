import * as React from "react";
import { Link, useLocation } from "wouter";
import { registerUser } from "@/api/user";
import { useSiteContent } from "@/hooks/usePublicContent";
import { toast } from "sonner";

export default function UserRegister() {
  const [, navigate] = useLocation();
  const { get } = useSiteContent();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    reasonForRegistration: "",
    emailConsent: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const consentText = get("register_consent_text", "I agree to receive email notifications about club events, updates, and related information based on my role.");

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        emailConsent: form.emailConsent,
        reasonForRegistration: form.reasonForRegistration,
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || "Registration failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    const pendingMsg = get("pending_approval_message", "Your registration is pending admin approval. You will be notified by email once your account is reviewed.");
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-black/50 border border-gray-800 p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-2xl font-heading font-bold text-white uppercase mb-4">
            Registration Submitted
          </h1>
          <p className="text-gray-400 mb-6">{pendingMsg}</p>
          <Link href="/login" className="inline-block bg-red-600 hover:bg-red-700 text-white font-heading uppercase px-6 py-2 transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-black/50 border border-gray-800 p-8">
          <h1 className="text-2xl font-heading font-bold text-white uppercase mb-6 text-center">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => update("name", e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => update("email", e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password * (min 6 characters)</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => update("password", e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm Password *</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={e => update("confirmPassword", e.target.value)}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Why do you want to join?</label>
              <textarea
                value={form.reasonForRegistration}
                onChange={e => update("reasonForRegistration", e.target.value)}
                rows={3}
                className="w-full bg-black/60 border border-gray-700 text-white px-3 py-2 focus:border-red-500 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.emailConsent}
                onChange={e => update("emailConsent", e.target.checked)}
                className="mt-1 accent-red-500"
              />
              <span className="text-sm text-gray-400">{consentText}</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-heading uppercase py-2.5 transition-colors disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 hover:text-red-300 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
