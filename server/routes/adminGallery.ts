import type { Router } from "express";
import { nanoid } from "nanoid";
import { requireAdmin } from "../auth/middleware";
import {
  createGalleryItem,
  deleteGalleryItem,
  listGallery,
  updateGalleryItem,
  type MediaType,
} from "../db/gallery";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

export function mountAdminGalleryRoutes(router: Router) {
  const upload = createUploadMiddleware({ maxMb: 25 });

  router.get("/gallery", requireAdmin, async (_req, res) => {
    const items = await listGallery();
    res.json({ ok: true, items });
  });

  router.post("/gallery/upload", requireAdmin, upload.single("file"), async (req, res) => {
    const url = getUploadedFileUrl(req);
    if (!url) return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "No file" } });
    const alt = req.body?.alt ? String(req.body.alt) : undefined;
    const caption = req.body?.caption ? String(req.body.caption) : undefined;
    const mime = (req as any).file?.mimetype as string | undefined;
    const type: MediaType = mime?.startsWith("video/") ? "video" : "image";
    const item = await createGalleryItem({
      id: nanoid(16),
      type,
      url,
      alt,
      caption,
      sortOrder: Number(req.body?.sortOrder || 0) || 0,
    });
    res.json({ ok: true, item });
  });

  router.post("/gallery/link", requireAdmin, async (req, res) => {
    const type = String(req.body?.type || "embed") as MediaType;
    const url = String(req.body?.url || "").trim();
    if (!url) return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "url is required" } });
    const caption = req.body?.caption ? String(req.body.caption) : undefined;
    const title = req.body?.title ? String(req.body.title) : undefined;
    const alt = req.body?.alt ? String(req.body.alt) : undefined;
    const safeType: MediaType = type === "image" || type === "video" ? type : "embed";
    const item = await createGalleryItem({
      id: nanoid(16),
      type: safeType,
      url,
      caption,
      title,
      alt,
      sortOrder: Number(req.body?.sortOrder || 0) || 0,
    });
    res.json({ ok: true, item });
  });

  router.patch("/gallery/:id", requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    const patch: any = {};
    if (req.body?.caption !== undefined) patch.caption = req.body.caption ? String(req.body.caption) : null;
    if (req.body?.alt !== undefined) patch.alt = req.body.alt ? String(req.body.alt) : null;
    if (req.body?.title !== undefined) patch.title = req.body.title ? String(req.body.title) : null;
    if (req.body?.sortOrder !== undefined) patch.sortOrder = Number(req.body.sortOrder);
    const updated = await updateGalleryItem(id, patch);
    if (!updated) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Item not found" } });
    res.json({ ok: true, item: updated });
  });

  router.delete("/gallery/:id", requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    await deleteGalleryItem(id);
    res.json({ ok: true });
  });
}
