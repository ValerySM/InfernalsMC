import fs from "node:fs";
import path from "node:path";
import type { Request } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { getPublicBaseUrl, getUploadDir } from "../config";

export function ensureUploadsDir() {
  const dir = getUploadDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sanitizeExt(ext: string) {
  const e = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  return e.startsWith(".") ? e : `.${e}`;
}

export function makePublicUploadUrl(filename: string) {
  const base = getPublicBaseUrl();
  const rel = `/uploads/${filename}`;
  return base ? `${base}${rel}` : rel;
}

export function createUploadMiddleware(opts?: { maxMb?: number }) {
  const dir = ensureUploadsDir();
  const maxMb = opts?.maxMb ?? 25;
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = sanitizeExt(path.extname(file.originalname) || "");
      const name = `${Date.now()}_${nanoid(10)}${ext}`;
      cb(null, name);
    },
  });

  const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/webm";
    if (!ok) {
      return cb(new Error("Only images (and mp4/webm videos) are allowed"));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxMb * 1024 * 1024,
    },
  });
}

export function getUploadedFileUrl(req: Request) {
  const f = (req as any).file as Express.Multer.File | undefined;
  if (!f) return null;
  return makePublicUploadUrl(f.filename);
}
