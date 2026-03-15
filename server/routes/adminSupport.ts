import type { Router } from "express";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import { listSupportMethods, createSupportMethod, updateSupportMethod, deleteSupportMethod } from "../db/supportMethods";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

const upload = createUploadMiddleware({ maxMb: 10 });

export function mountAdminSupportRoutes(router: Router) {
  // List
  router.get("/support-methods", requireAdmin, async (_req, res) => {
    try {
      const methods = await listSupportMethods();
      return res.json({ ok: true, methods });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Create
  router.post("/support-methods", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const title = String(req.body?.title || "").trim();
      if (!title) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "title is required" } });
      }
      const method = await createSupportMethod({
        id: nanoid(16),
        title,
        description: req.body?.description,
        link: req.body?.link,
        qrImageUrl: req.body?.qrImage,
        sortOrder: typeof req.body?.sortOrder === "number" ? req.body.sortOrder : undefined,
      });
      return res.json({ ok: true, method });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Update
  router.patch("/support-methods/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const method = await updateSupportMethod(req.params.id, {
        title: req.body?.title,
        description: req.body?.description !== undefined ? (req.body.description || null) : undefined,
        link: req.body?.link !== undefined ? (req.body.link || null) : undefined,
        qrImageUrl: req.body?.qrImage !== undefined ? (req.body.qrImage || null) : undefined,
        sortOrder: req.body?.sortOrder,
      });
      if (!method) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Method not found" } });
      return res.json({ ok: true, method });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Upload QR image for support method
  router.post("/support-methods/:id/qr", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const url = getUploadedFileUrl(req);
      if (!url) return res.status(400).json({ ok: false, error: { code: "NO_FILE", message: "No file uploaded" } });
      const method = await updateSupportMethod(req.params.id, { qrImageUrl: url });
      if (!method) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Method not found" } });
      return res.json({ ok: true, method, url });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Delete
  router.delete("/support-methods/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      await deleteSupportMethod(req.params.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });
}
