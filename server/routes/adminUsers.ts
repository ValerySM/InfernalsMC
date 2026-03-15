import type { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { requireAdmin, requireSuperAdmin, type AuthedRequest } from "../auth/middleware";
import type { AdminRole } from "../auth/jwt";
import {
  createAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../db/users";

function normalizeRole(input: any): AdminRole {
  return input === "superadmin" ? "superadmin" : "admin";
}

export function mountAdminUserRoutes(router: Router) {
  router.get("/users", requireAdmin, async (_req, res) => {
    const users = await listAdminUsers();
    res.json({ ok: true, users });
  });

  router.post("/users", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const name = String(req.body?.name || "").trim();
      const password = String(req.body?.password || "");
      const isActive = req.body?.isActive !== undefined ? Boolean(req.body.isActive) : true;
      let role = normalizeRole(req.body?.role);

      if (!email || !name || !password) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "name, email and password are required" } });
      }

      // Non-superadmin cannot create superadmins
      if (req.admin?.role !== "superadmin") role = "admin";

      const passwordHash = await bcrypt.hash(password, 10);
      const row = await createAdminUser({
        id: nanoid(16),
        email,
        name,
        passwordHash,
        role,
        isActive,
      });
      return res.json({ ok: true, user: { id: row.id, email: row.email, name: row.name, role: row.role, isActive: row.is_active } });
    } catch (e: any) {
      const msg = e?.message || "Server error";
      const code = msg.includes("unique") ? "EMAIL_EXISTS" : "SERVER_ERROR";
      return res.status(500).json({ ok: false, error: { code, message: msg } });
    }
  });

  router.patch("/users/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const id = String(req.params.id);
      const patch: any = {};

      if (typeof req.body?.name === "string") patch.name = String(req.body.name).trim();
      if (typeof req.body?.isActive === "boolean") patch.isActive = Boolean(req.body.isActive);

      if (typeof req.body?.password === "string" && String(req.body.password)) {
        patch.passwordHash = await bcrypt.hash(String(req.body.password), 10);
      }

      if (req.body?.role !== undefined) {
        if (req.admin?.role !== "superadmin") {
          // regular admins cannot change roles
        } else {
          patch.role = normalizeRole(req.body.role);
        }
      }

      // prevent self-deactivation
      if (req.admin?.id === id && patch.isActive === false) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "You cannot deactivate yourself" } });
      }

      const updated = await updateAdminUser(id, patch);
      if (!updated) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "User not found" } });
      return res.json({
        ok: true,
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          role: updated.role,
          isActive: updated.is_active,
        },
      });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  router.delete("/users/:id", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
    const id = String(req.params.id);
    if (req.admin?.id === id) {
      return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "You cannot delete yourself" } });
    }
    await deleteAdminUser(id);
    return res.json({ ok: true });
  });
}
