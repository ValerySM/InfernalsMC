import type { Router } from "express";
import { listEvents, getEventBySlug, type EventCategory } from "../db/events";
import { listGallery } from "../db/gallery";
import { getAllContent, getContentValues } from "../db/siteContent";
import { listMembers } from "../db/members";
import { listArtProjects, getArtProjectBySlug } from "../db/artProjects";
import { listSupportMethods } from "../db/supportMethods";

function parseCategory(v: any): EventCategory {
  if (v === "training" || v === "organized") return v;
  return "event";
}

export function mountPublicRoutes(router: Router) {
  // ── Events ──
  router.get("/events", async (req, res) => {
    const category = req.query.category ? parseCategory(String(req.query.category)) : undefined;
    const events = await listEvents({ category });
    res.json({ ok: true, events });
  });

  router.get("/events/:slug", async (req, res) => {
    const slug = String(req.params.slug);
    const event = await getEventBySlug(slug);
    if (!event) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Event not found" } });
    res.json({ ok: true, event });
  });

  // ── Gallery ──
  router.get("/gallery", async (_req, res) => {
    const items = await listGallery();
    res.json({ ok: true, items });
  });

  // ── Site Content (all or by keys) ──
  router.get("/site-content", async (req, res) => {
    const keysParam = req.query.keys as string | undefined;
    if (keysParam) {
      const keys = keysParam.split(",").map(k => k.trim()).filter(Boolean);
      const content = await getContentValues(keys);
      return res.json({ ok: true, content });
    }
    const content = await getAllContent();
    res.json({ ok: true, content });
  });

  // ── Club Members ──
  router.get("/members", async (_req, res) => {
    const members = await listMembers();
    res.json({ ok: true, members });
  });

  // ── Art Projects ──
  router.get("/art-projects", async (_req, res) => {
    const projects = await listArtProjects();
    res.json({ ok: true, projects });
  });

  router.get("/art-projects/:slug", async (req, res) => {
    const project = await getArtProjectBySlug(req.params.slug);
    if (!project) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
    res.json({ ok: true, project });
  });

  // ── Support Methods ──
  router.get("/support-methods", async (_req, res) => {
    const methods = await listSupportMethods();
    res.json({ ok: true, methods });
  });
}
