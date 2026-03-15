import path from "node:path";

export type NodeEnv = "development" | "production" | "test";

export function getNodeEnv(): NodeEnv {
  const v = (process.env.NODE_ENV || "development") as NodeEnv;
  if (v === "production" || v === "test") return v;
  return "development";
}

export function isProd() {
  return getNodeEnv() === "production";
}

export function getServerPort() {
  // In dev, Vite defaults to 5173. Default API server is 3001.
  const fallback = isProd() ? 3000 : 3001;
  const port = Number(process.env.PORT || fallback);
  return Number.isFinite(port) ? port : fallback;
}

export function getJwtSecret() {
  return process.env.ADMIN_JWT_SECRET || "dev_change_me_ADMIN_JWT_SECRET";
}

export function getCookieName() {
  return process.env.ADMIN_COOKIE_NAME || "admin_session";
}

export function getCookieMaxAgeMs() {
  const days = Number(process.env.ADMIN_SESSION_DAYS || 7);
  const safeDays = Number.isFinite(days) && days > 0 ? days : 7;
  return safeDays * 24 * 60 * 60 * 1000;
}

export function getDatabaseUrl() {
  // Prefer DATABASE_URL. Otherwise build from parts.
  const url = process.env.DATABASE_URL;
  if (url && url.trim()) return url.trim();

  const host = process.env.PGHOST || "127.0.0.1";
  const port = process.env.PGPORT || "5432";
  const db = process.env.PGDATABASE || "infernals_cms";
  const user = process.env.PGUSER || "postgres";
  const pass = process.env.PGPASSWORD || "";

  const auth = pass ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}` : encodeURIComponent(user);
  return `postgres://${auth}@${host}:${port}/${db}`;
}

export function getUploadDir() {
  // uploads are stored at repo root (or next to dist) to survive rebuilds
  return path.resolve(process.cwd(), "uploads");
}

export function getPublicBaseUrl() {
  // Optional, used if you want absolute URLs in API responses.
  // If empty, API returns relative /uploads/... URLs.
  return (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
}

export function getDevCorsOrigins(): string[] {
  const raw = process.env.DEV_CORS_ORIGINS || "http://localhost:3000,http://localhost:5173";
  return raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
