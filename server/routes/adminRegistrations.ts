import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import { listPendingRequests, listAllRequests, decideRequest, countPendingRequests } from "../db/registrationRequests";
import { listUsers, updateUser, getUserById, deleteUser, countUsersByStatus } from "../db/siteUsers";
import { listAdminNotifications, countUnreadNotifications, markNotificationRead, markAllNotificationsRead } from "../db/adminNotifications";
import { listEmailLogs, countEmailLogs } from "../db/emailLogs";
import { sendEmail } from "../utils/email";

export function mountAdminRegistrationRoutes(router: Router) {
  // ── Pending registrations ──
  router.get("/registrations/pending", requireAdmin as any, async (_req, res) => {
    try {
      const requests = await listPendingRequests();
      return res.json({ ok: true, data: requests });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ── All registrations ──
  router.get("/registrations", requireAdmin as any, async (_req, res) => {
    try {
      const requests = await listAllRequests(200);
      return res.json({ ok: true, data: requests });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ── Count pending ──
  router.get("/registrations/pending-count", requireAdmin as any, async (_req, res) => {
    try {
      const count = await countPendingRequests();
      return res.json({ ok: true, data: { count } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ── Approve/Reject registration ──
  router.post("/registrations/:id/decide", requireAdmin as any, async (req: AuthedRequest, res) => {
    try {
      const { id } = req.params;
      const { decision, assignedRole } = req.body;

      if (!decision || !["approved", "rejected"].includes(decision)) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Decision must be 'approved' or 'rejected'." } });
      }

      if (decision === "approved" && !assignedRole) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Must assign a role when approving." } });
      }

      const request = await decideRequest(id, {
        decision,
        assignedRole: decision === "approved" ? assignedRole : undefined,
        decidedBy: req.admin!.id,
      });

      if (!request) {
        return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Request not found." } });
      }

      // Update user status and role
      if (decision === "approved") {
        await updateUser(request.userId, {
          status: "active",
          role: assignedRole,
        });

        // Send approval email
        const user = await getUserById(request.userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: "Registration Approved!",
            body: `Hello ${user.name},\n\nYour registration has been approved! You have been assigned the role: ${assignedRole}.\n\nYou can now log in to your account.`,
            recipientUserId: user.id,
            sendType: "registration_approved",
          });
        }
      } else {
        await updateUser(request.userId, { status: "rejected" });

        const user = await getUserById(request.userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: "Registration Update",
            body: `Hello ${user.name},\n\nUnfortunately, your registration request was not approved at this time.\n\nIf you have questions, please contact the club.`,
            recipientUserId: user.id,
            sendType: "registration_rejected",
          });
        }
      }

      return res.json({ ok: true, data: request });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Site Users management
  // ═══════════════════════════════════════════
  router.get("/site-users", requireAdmin as any, async (req, res) => {
    try {
      const { status, role } = req.query;
      const users = await listUsers({
        status: status as any,
        role: role as any,
      });
      return res.json({ ok: true, data: users });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.get("/site-users/counts", requireAdmin as any, async (_req, res) => {
    try {
      const [pending, active, rejected, deactivated] = await Promise.all([
        countUsersByStatus("pending_approval"),
        countUsersByStatus("active"),
        countUsersByStatus("rejected"),
        countUsersByStatus("deactivated"),
      ]);
      return res.json({ ok: true, data: { pending, active, rejected, deactivated, total: pending + active + rejected + deactivated } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.patch("/site-users/:id", requireAdmin as any, async (req, res) => {
    try {
      const { id } = req.params;
      const { role, status, name } = req.body;
      const updated = await updateUser(id, {
        role: role || undefined,
        status: status || undefined,
        name: name || undefined,
      });
      if (!updated) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "User not found." } });
      return res.json({ ok: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/site-users/:id/reset-password", requireAdmin as any, async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ ok: false, error: { code: "VALIDATION", message: "Password must be at least 6 characters." } });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      const updated = await updateUser(id, { passwordHash: hash });
      if (!updated) return res.status(404).json({ ok: false });
      return res.json({ ok: true, data: { message: "Password reset." } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.delete("/site-users/:id", requireAdmin as any, async (req, res) => {
    try {
      await deleteUser(req.params.id);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Admin Notifications
  // ═══════════════════════════════════════════
  router.get("/notifications", requireAdmin as any, async (req: AuthedRequest, res) => {
    try {
      const notifications = await listAdminNotifications(req.admin!.id);
      return res.json({ ok: true, data: notifications });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.get("/notifications/unread-count", requireAdmin as any, async (req: AuthedRequest, res) => {
    try {
      const count = await countUnreadNotifications(req.admin!.id);
      return res.json({ ok: true, data: { count } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/notifications/:id/read", requireAdmin as any, async (req, res) => {
    try {
      await markNotificationRead(req.params.id);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  router.post("/notifications/read-all", requireAdmin as any, async (req: AuthedRequest, res) => {
    try {
      await markAllNotificationsRead(req.admin!.id);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });

  // ═══════════════════════════════════════════
  // Email Logs
  // ═══════════════════════════════════════════
  router.get("/email-logs", requireAdmin as any, async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 100;
      const offset = Number(req.query.offset) || 0;
      const logs = await listEmailLogs(limit, offset);
      const total = await countEmailLogs();
      return res.json({ ok: true, data: { logs, total } });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: err.message } });
    }
  });
}
