import type { Router } from "express";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import { listMembers, createMember, updateMember, deleteMember, reorderMembers } from "../db/members";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

const upload = createUploadMiddleware({ maxMb: 10 });

export function mountAdminMemberRoutes(router: Router) {
  // List
  router.get("/members", requireAdmin, async (_req, res) => {
    try {
      const members = await listMembers();
      return res.json({ ok: true, members });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Create
  router.post("/members", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const name = String(req.body?.name || "").trim();
      const role = String(req.body?.role || "").trim();
      if (!name || !role) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "name and role are required" } });
      }
      const member = await createMember({
        id: nanoid(16),
        name,
        role,
        photoUrl: req.body?.photoUrl || undefined,
        sortOrder: typeof req.body?.sortOrder === "number" ? req.body.sortOrder : undefined,
      });
      return res.json({ ok: true, member });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Update
  router.patch("/members/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const member = await updateMember(req.params.id, {
        name: req.body?.name,
        role: req.body?.role,
        photoUrl: req.body?.photoUrl,
        sortOrder: req.body?.sortOrder,
      });
      if (!member) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
      return res.json({ ok: true, member });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Upload photo for member
  router.post("/members/:id/photo", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const url = getUploadedFileUrl(req);
      if (!url) return res.status(400).json({ ok: false, error: { code: "NO_FILE", message: "No file uploaded" } });
      const member = await updateMember(req.params.id, { photoUrl: url });
      if (!member) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
      return res.json({ ok: true, member, url });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Delete
  router.delete("/members/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      await deleteMember(req.params.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Reorder
  router.put("/members/reorder", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const ids = req.body?.ids;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "ids array is required" } });
      }
      await reorderMembers(ids);
      const members = await listMembers();
      return res.json({ ok: true, members });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });
}
