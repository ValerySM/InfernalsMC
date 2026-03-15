import type { Router } from "express";
import { nanoid } from "nanoid";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import {
  listArtProjects,
  getArtProjectById,
  createArtProject,
  updateArtProject,
  deleteArtProject,
  setArtProjectCover,
  addArtProjectMedia,
  deleteArtProjectMedia,
  reorderArtProjectMedia,
} from "../db/artProjects";
import { createUploadMiddleware, getUploadedFileUrl } from "../utils/uploads";

const upload = createUploadMiddleware({ maxMb: 25 });

export function mountAdminArtProjectRoutes(router: Router) {
  // List all projects
  router.get("/art-projects", requireAdmin, async (_req, res) => {
    try {
      const projects = await listArtProjects();
      return res.json({ ok: true, projects });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Get single project with media
  router.get("/art-projects/:id", requireAdmin, async (req, res) => {
    try {
      const project = await getArtProjectById(req.params.id);
      if (!project) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
      return res.json({ ok: true, project, mediaAdmin: project.mediaRows });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Create
  router.post("/art-projects", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const title = String(req.body?.title || "").trim();
      const slug = String(req.body?.slug || "").trim();
      const shortDescription = String(req.body?.shortDescription || "").trim();
      const description = String(req.body?.description || "").trim();
      if (!title || !slug || !shortDescription || !description) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "title, slug, shortDescription, and description are required" } });
      }
      const project = await createArtProject({
        id: nanoid(16),
        slug,
        title,
        shortDescription,
        description,
        tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
        cover: req.body?.cover,
        sortOrder: typeof req.body?.sortOrder === "number" ? req.body.sortOrder : undefined,
      });
      return res.json({ ok: true, project });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Update
  router.patch("/art-projects/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const project = await updateArtProject(req.params.id, {
        slug: req.body?.slug,
        title: req.body?.title,
        shortDescription: req.body?.shortDescription,
        description: req.body?.description,
        tags: req.body?.tags,
        cover: req.body?.cover,
        sortOrder: req.body?.sortOrder,
      });
      if (!project) return res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found" } });
      return res.json({ ok: true, project });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Delete
  router.delete("/art-projects/:id", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      await deleteArtProject(req.params.id);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Upload cover
  router.post("/art-projects/:id/cover", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const url = getUploadedFileUrl(req);
      if (!url) return res.status(400).json({ ok: false, error: { code: "NO_FILE", message: "No file uploaded" } });
      await setArtProjectCover(req.params.id, url);
      return res.json({ ok: true, url });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Upload media file
  router.post("/art-projects/:id/media/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      const url = getUploadedFileUrl(req);
      if (!url) return res.status(400).json({ ok: false, error: { code: "NO_FILE", message: "No file uploaded" } });
      const type = /\.(mp4|webm)$/i.test(url) ? "video" : "image";
      const media = await addArtProjectMedia({
        id: nanoid(16),
        projectId: req.params.id,
        type,
        url,
      });
      return res.json({ ok: true, media });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Add media link
  router.post("/art-projects/:id/media/link", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const type = req.body?.type;
      const url = String(req.body?.url || "").trim();
      if (!url || !["image", "embed", "video"].includes(type)) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "type and url are required" } });
      }
      const media = await addArtProjectMedia({
        id: nanoid(16),
        projectId: req.params.id,
        type,
        url,
        alt: req.body?.alt,
        title: req.body?.title,
      });
      return res.json({ ok: true, media });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Delete media
  router.delete("/art-projects/media/:mediaId", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      await deleteArtProjectMedia(req.params.mediaId);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  // Reorder media
  router.put("/art-projects/:id/media/reorder", requireAdmin, async (req: AuthedRequest, res) => {
    try {
      const ids = req.body?.ids;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "ids array is required" } });
      }
      await reorderArtProjectMedia(req.params.id, ids);
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });
}
