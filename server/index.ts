import "dotenv/config";

import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { getDevCorsOrigins, getServerPort, getUploadDir, isProd } from "./config";
import { initDb } from "./db/init";
import { ensureUploadsDir } from "./utils/uploads";
import { mountAdminAuthRoutes } from "./routes/adminAuth";
import { mountAdminUserRoutes } from "./routes/adminUsers";
import { mountAdminEventRoutes } from "./routes/adminEvents";
import { mountAdminGalleryRoutes } from "./routes/adminGallery";
import { mountAdminSiteContentRoutes } from "./routes/adminSiteContent";
import { mountAdminMemberRoutes } from "./routes/adminMembers";
import { mountAdminArtProjectRoutes } from "./routes/adminArtProjects";
import { mountAdminSupportRoutes } from "./routes/adminSupport";
import { mountAdminRegistrationRoutes } from "./routes/adminRegistrations";
import { mountPublicRoutes } from "./routes/public";
import { mountUserAuthRoutes } from "./routes/userAuth";
import { mountSecretaryRoutes } from "./routes/secretaryRoutes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function maybeDevCors(app: express.Express) {
  if (isProd()) return;
  const allow = new Set(getDevCorsOrigins());
  app.use((req, res, next) => {
    const origin = String(req.headers.origin || "");
    if (origin && allow.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      if (req.method === "OPTIONS") return res.sendStatus(204);
    }
    next();
  });
}

async function startServer() {
  // Ensure folders
  ensureUploadsDir();

  // Initialize DB schema + bootstrap admin
  try {
    await initDb();
  } catch (err: any) {
    const raw = String(process.env.DATABASE_URL || "");
    let safe = raw;
    try {
      if (raw.startsWith("postgres://") || raw.startsWith("postgresql://")) {
        const u = new URL(raw);
        if (u.password) u.password = "***";
        safe = u.toString();
      }
    } catch {
      // ignore
    }

    console.error("\n❌ Failed to initialize database.\n" +
      "- Make sure PostgreSQL is running\n" +
      "- Make sure the database exists (e.g. infernals_cms)\n" +
      "- Check DATABASE_URL in .env\n" +
      (safe ? `DATABASE_URL: ${safe}\n` : "")
    );
    throw err;
  }

  const app = express();
  const server = createServer(app);

  maybeDevCors(app);

  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // uploads
  const uploadDir = getUploadDir();
  app.use("/uploads", express.static(uploadDir));

  // ── Admin API routes ──
  const adminRouter = express.Router();
  mountAdminAuthRoutes(adminRouter);
  mountAdminUserRoutes(adminRouter);
  mountAdminEventRoutes(adminRouter);
  mountAdminGalleryRoutes(adminRouter);
  mountAdminSiteContentRoutes(adminRouter);
  mountAdminMemberRoutes(adminRouter);
  mountAdminArtProjectRoutes(adminRouter);
  mountAdminSupportRoutes(adminRouter);
  mountAdminRegistrationRoutes(adminRouter);
  app.use("/api/admin", adminRouter);

  // ── User auth routes (public: register, login, etc.) ──
  const userAuthRouter = express.Router();
  mountUserAuthRoutes(userAuthRouter);
  app.use("/api/user", userAuthRouter);

  // ── Secretary / member routes (requires user auth) ──
  const secretaryRouter = express.Router();
  mountSecretaryRoutes(secretaryRouter);
  app.use("/api/secretary", secretaryRouter);

  // ── Public API routes ──
  const publicRouter = express.Router();
  mountPublicRoutes(publicRouter);
  app.use("/api/public", publicRouter);

  // Basic health
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // API error handler (multer, etc.)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const msg = err?.message || "Server error";
    res.status(400).json({ ok: false, error: { code: "REQUEST_ERROR", message: msg } });
  });

  // Serve frontend only in production (or if dist exists)
  const staticPath = isProd()
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

  const hasStatic = fs.existsSync(staticPath) && fs.existsSync(path.join(staticPath, "index.html"));
  if (hasStatic) {
    app.use(express.static(staticPath));

    // Client-side routing
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    // In dev we typically run Vite separately.
    app.get("/", (_req, res) => {
      res.type("text/plain").send("API server is running. Start the web app with: npm run dev");
    });
  }

  const port = getServerPort();
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(err => {
  console.error(err);
  process.exit(1);
});
