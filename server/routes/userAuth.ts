import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { createUser, getUserByEmail, getUserById, updateUser, getUserByResetToken } from "../db/siteUsers";
import { createRegRequest } from "../db/registrationRequests";
import { notifyAllAdmins } from "../db/adminNotifications";
import { signUserJwt, USER_COOKIE_NAME } from "../auth/userJwt";
import { getCookieMaxAgeMs } from "../config";
import { requireUser, type UserAuthedRequest } from "../auth/userMiddleware";
import { sendEmail } from "../utils/email";

export function mountUserAuthRoutes(router: Router) {
  // ── Register ──
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password, emailConsent, reasonForRegistration } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Name, email, and password are required." } });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Invalid email format." } });
      }

      if (password.length < 6) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Password must be at least 6 characters." } });
      }

      // Check if email already exists
      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ ok: false, error: { code: "EMAIL_EXISTS", message: "An account with this email already exists." } });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = nanoid(16);

      const user = await createUser({
        id: userId,
        name: name.trim(),
        email: email.trim(),
        passwordHash,
        emailConsent: !!emailConsent,
        reasonForRegistration: reasonForRegistration?.trim() || undefined,
      });

      // Create registration request
      await createRegRequest({
        id: nanoid(16),
        userId,
        reasonForRegistration: reasonForRegistration?.trim() || undefined,
      });

      // Notify all admins
      await notifyAllAdmins({
        notificationType: "new_registration",
        title: "New Registration Request",
        message: `${name} (${email}) has registered and is waiting for approval.`,
        relatedUserId: userId,
        generateId: () => nanoid(16),
      });

      return res.json({ ok: true, data: { user, message: "Registration submitted. Awaiting admin approval." } });
    } catch (err: any) {
      console.error("Register error:", err);
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Registration failed." } });
    }
  });

  // ── Login ──
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Email and password are required." } });
      }

      const userRow = await getUserByEmail(email);
      if (!userRow) {
        return res.status(401).json({ ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } });
      }

      const valid = await bcrypt.compare(password, userRow.password_hash);
      if (!valid) {
        return res.status(401).json({ ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." } });
      }

      // Check status
      if (userRow.status === "pending_approval") {
        return res.status(403).json({ ok: false, error: { code: "PENDING_APPROVAL", message: "Your account is pending admin approval." } });
      }
      if (userRow.status === "rejected") {
        return res.status(403).json({ ok: false, error: { code: "REJECTED", message: "Your registration was not approved." } });
      }
      if (userRow.status === "deactivated") {
        return res.status(403).json({ ok: false, error: { code: "DEACTIVATED", message: "Your account has been deactivated." } });
      }

      const token = signUserJwt({ sub: userRow.id, role: userRow.role as any });
      res.cookie(USER_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: getCookieMaxAgeMs(),
        path: "/",
      });

      return res.json({ ok: true, data: { user: userRow.public } });
    } catch (err: any) {
      console.error("Login error:", err);
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Login failed." } });
    }
  });

  // ── Logout ──
  router.post("/logout", (_req, res) => {
    res.clearCookie(USER_COOKIE_NAME, { path: "/" });
    return res.json({ ok: true });
  });

  // ── Me (current user) ──
  router.get("/me", requireUser as any, async (req: UserAuthedRequest, res) => {
    if (!req.siteUser) return res.status(401).json({ ok: false });
    return res.json({ ok: true, data: { user: req.siteUser } });
  });

  // ── Update profile ──
  router.patch("/me", requireUser as any, async (req: UserAuthedRequest, res) => {
    if (!req.siteUser) return res.status(401).json({ ok: false });
    try {
      const { name, phone, address, notes, additionalInfo, emailConsent } = req.body;
      const updated = await updateUser(req.siteUser.id, {
        name: name || undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
        notes: notes !== undefined ? notes : undefined,
        additionalInfo: additionalInfo !== undefined ? additionalInfo : undefined,
        emailConsent: typeof emailConsent === "boolean" ? emailConsent : undefined,
      });
      return res.json({ ok: true, data: { user: updated } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Update failed." } });
    }
  });

  // ── Change password ──
  router.post("/change-password", requireUser as any, async (req: UserAuthedRequest, res) => {
    if (!req.siteUser) return res.status(401).json({ ok: false });
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Both passwords required." } });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "New password must be at least 6 characters." } });
      }

      const userRow = await getUserByEmail(req.siteUser.email);
      if (!userRow) return res.status(404).json({ ok: false });

      const valid = await bcrypt.compare(currentPassword, userRow.password_hash);
      if (!valid) {
        return res.status(401).json({ ok: false, error: { code: "INVALID_PASSWORD", message: "Current password is incorrect." } });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await updateUser(req.siteUser.id, { passwordHash: newHash });
      return res.json({ ok: true, data: { message: "Password changed successfully." } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Failed to change password." } });
    }
  });

  // ── Forgot password ──
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Email is required." } });
      }

      const userRow = await getUserByEmail(email);
      if (!userRow) {
        // Don't reveal whether email exists
        return res.json({ ok: true, data: { message: "If this email is registered, a reset link has been sent." } });
      }

      const token = nanoid(32);
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await updateUser(userRow.id, { resetToken: token, resetTokenExpires: expires });

      // Send email with reset link
      await sendEmail({
        to: userRow.email,
        subject: "Password Reset Request",
        body: `You requested a password reset. Use this token to reset your password: ${token}\n\nThis token expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
        recipientUserId: userRow.id,
        sendType: "password_reset",
      });

      return res.json({ ok: true, data: { message: "If this email is registered, a reset link has been sent." } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Failed." } });
    }
  });

  // ── Reset password ──
  router.post("/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Token and new password required." } });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Password must be at least 6 characters." } });
      }

      const userRow = await getUserByResetToken(token);
      if (!userRow) {
        return res.status(400).json({ ok: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired reset token." } });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await updateUser(userRow.id, { passwordHash: newHash, resetToken: null, resetTokenExpires: null });

      return res.json({ ok: true, data: { message: "Password reset successfully. You can now log in." } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: "Failed." } });
    }
  });
}
