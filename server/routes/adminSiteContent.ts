import type { Router } from "express";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import { getAllContent, setContentValues, setContentValue, deleteContentValue } from "../db/siteContent";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

const upload = createUploadMiddleware({ maxMb: 10 });

export function mountAdminSiteContentRoutes(router: Router) {
  // List all content
  router.get("/site-content", requireAdmin, async (_req, res) => {
    try {
      const content = await getAllContent();
      return res.json({ ok: true, content });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Bulk update content
  router.put("/site-content", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const entries = req.body?.entries;
      if (!entries || typeof entries !== "object") {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "entries object is required" } });
      }
      await setContentValues(entries);
      const content = await getAllContent();
      return res.json({ ok: true, content });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Update single key
  router.put("/site-content/:key", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const key = req.params.key;
      const value = String(req.body?.value ?? "");
      await setContentValue(key, value);
      return res.json({ ok: true, key, value });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Delete a key
  router.delete("/site-content/:key", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      await deleteContentValue(req.params.key);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Upload image for site content (hero, etc.)
  router.post("/site-content/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const url = getUploadedFileUrl(req);
      if (!url) return res.status(400).json({ ok: false, error: { code: "NO_FILE", message: "No file uploaded" } });
      return res.json({ ok: true, url });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });
}
