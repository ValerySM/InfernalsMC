import type { Router } from "express";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import {
  addEventMedia,
  createEvent,
  deleteEvent,
  deleteMedia,
  getEventById,
  listEvents,
  reorderEventMedia,
  setEventCoverUrl,
  updateEvent,
  type EventCategory,
  type MediaType,
} from "../db/events";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

function parseCategory(v: any): EventCategory {
  if (v === "training" || v === "organized") return v;
  return "event";
}

function parseTags(v: any): string[] {
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function mountAdminEventRoutes(router: Router) {
  const upload = createUploadMiddleware({ maxMb: 25 });

  router.get("/events", requireAdmin, async (req, res) => {
    const category = req.query.category ? parseCategory(String(req.query.category)) : undefined;
    const events = await listEvents({ category });
    res.json({ ok: true, events });
  });

  router.get("/events/:id", requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    const event = await getEventById(id);
    if (!event) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Event not found" } });
    const mediaAdmin = event.mediaRows
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(m => ({
        id: m.id,
        type: m.type,
        url: m.url,
        alt: m.alt || undefined,
        title: m.title || undefined,
        sortOrder: m.sort_order,
      }));
    const { mediaRows, ...rest } = event as any;
    res.json({ ok: true, event: rest, mediaAdmin });
  });

  router.post("/events", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const body = req.body || {};
      const title = String(body.title || "").trim();
      const slug = String(body.slug || "").trim();
      const date = String(body.date || "").trim();
      const time = body.time ? String(body.time).trim() : undefined;
      const location = body.location ? String(body.location).trim() : undefined;
      const shortDescription = String(body.shortDescription || "").trim();
      const description = String(body.description || "").trim();
      const category = parseCategory(body.category);
      const tags = parseTags(body.tags);
      const externalUrl = body.externalUrl ? String(body.externalUrl).trim() : undefined;

      if (!title || !slug || !date || !shortDescription || !description) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "Missing required fields" } });
      }

      const event = await createEvent({
        id: nanoid(16),
        title,
        slug,
        date,
        time,
        location,
        shortDescription,
        description,
        category,
        tags,
        externalUrl,
      });
      return res.json({ ok: true, event });
    } catch (e: any) {
      const msg = e?.message || "Server error";
      const code = msg.includes("unique") ? "SLUG_EXISTS" : "SERVER_ERROR";
      return res.status(500).json({ ok: false, error: { code, message: msg } });
    }
  });

  router.put("/events/:id", requireAdmin, async (req, res) => {
    try {
      const id = String(req.params.id);
      const body = req.body || {};
      const patch: any = {};

      if (body.slug !== undefined) patch.slug = String(body.slug).trim();
      if (body.title !== undefined) patch.title = String(body.title).trim();
      if (body.date !== undefined) patch.date = String(body.date).trim();
      if (body.time !== undefined) patch.time = body.time ? String(body.time).trim() : null;
      if (body.location !== undefined) patch.location = body.location ? String(body.location).trim() : null;
      if (body.shortDescription !== undefined) patch.shortDescription = String(body.shortDescription).trim();
      if (body.description !== undefined) patch.description = String(body.description).trim();
      if (body.category !== undefined) patch.category = parseCategory(body.category);
      if (body.tags !== undefined) patch.tags = parseTags(body.tags);
      if (body.externalUrl !== undefined) patch.externalUrl = body.externalUrl ? String(body.externalUrl).trim() : null;

      const updated = await updateEvent(id, patch);
      if (!updated) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Event not found" } });
      return res.json({ ok: true, event: updated });
    } catch (e: any) {
      const msg = e?.message || "Server error";
      const code = msg.includes("unique") ? "SLUG_EXISTS" : "SERVER_ERROR";
      return res.status(500).json({ ok: false, error: { code, message: msg } });
    }
  });

  router.delete("/events/:id", requireAdmin, async (req, res) => {
    const id = String(req.params.id);
    await deleteEvent(id);
    return res.json({ ok: true });
  });

  router.post("/events/:id/cover/upload", requireAdmin, upload.single("file"), async (req, res) => {
    const id = String(req.params.id);
    const url = getUploadedFileUrl(req);
    if (!url) return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "No file" } });
    await setEventCoverUrl(id, url);
    return res.json({ ok: true, cover: url });
  });

  router.post("/events/:id/media/upload", requireAdmin, upload.single("file"), async (req, res) => {
    const eventId = String(req.params.id);
    const url = getUploadedFileUrl(req);
    if (!url) return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "No file" } });
    const mime = (req as any).file?.mimetype as string | undefined;
    const type: MediaType = mime?.startsWith("video/") ? "video" : "image";
    const alt = req.body?.alt ? String(req.body.alt) : undefined;
    const title = req.body?.title ? String(req.body.title) : undefined;
    const row = await addEventMedia({
      id: nanoid(16),
      eventId,
      type,
      url,
      alt,
      title,
      sortOrder: Number(req.body?.sortOrder || 0) || 0,
    });
    return res.json({ ok: true, media: row });
  });

  router.post("/events/:id/media/link", requireAdmin, async (req, res) => {
    const eventId = String(req.params.id);
    const type = String(req.body?.type || "embed") as MediaType;
    const url = String(req.body?.url || "").trim();
    if (!url) return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "url is required" } });
    const title = req.body?.title ? String(req.body.title).trim() : undefined;
    const alt = req.body?.alt ? String(req.body.alt).trim() : undefined;
    const safeType: MediaType = type === "image" || type === "video" ? type : "embed";
    const row = await addEventMedia({
      id: nanoid(16),
      eventId,
      type: safeType,
      url,
      title,
      alt,
      sortOrder: Number(req.body?.sortOrder || 0) || 0,
    });
    return res.json({ ok: true, media: row });
  });

  router.delete("/media/:mediaId", requireAdmin, async (req, res) => {
    const mediaId = String(req.params.mediaId);
    await deleteMedia(mediaId);
    return res.json({ ok: true });
  });

  router.patch("/events/:id/media/reorder", requireAdmin, async (req, res) => {
    const eventId = String(req.params.id);
    const orderedIds = Array.isArray(req.body?.orderedIds)
      ? (req.body.orderedIds as any[]).map(String)
      : [];
    if (!orderedIds.length) {
      return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "orderedIds is required" } });
    }
    await reorderEventMedia(eventId, orderedIds);
    return res.json({ ok: true });
  });
}
