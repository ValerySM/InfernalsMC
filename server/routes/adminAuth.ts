import type { Router } from "express";
import bcrypt from "bcryptjs";
import { getCookieMaxAgeMs, getCookieName, isProd } from "../config";
import { signAdminJwt } from "../auth/jwt";
import { requireAdmin, type AuthedRequest } from "../auth/middleware";
import { getAdminUserByEmail, updateAdminUser } from "../db/users";

function looksLikeBcryptHash(value: string) {
  // bcrypt hashes are typically 60 chars and start with $2a$/$2b$/$2y$
  return typeof value === "string" && value.length >= 50 && /^\$2[aby]\$/.test(value);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd(),
    maxAge: getCookieMaxAgeMs(),
    path: "/",
  };
}

export function mountAdminAuthRoutes(router: Router) {
  router.post("/auth/login", async (req, res) => {
    try {
      const email = String(req.body?.email || "").trim().toLowerCase();
      const password = String(req.body?.password || "");
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: { code: "BAD_REQUEST", message: "Email and password are required" } });
      }

      const row = await getAdminUserByEmail(email);
      if (!row || !row.is_active) {
        return res.status(401).json({ ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
      }

      // -------------------------------------------------------------------
      // Password check
      // - Normal path: bcrypt.compare(plain, bcryptHash)
      // - Compatibility path: if DB contains a plain password (user edited DB)
      //   accept it once and immediately migrate to bcrypt.
      // -------------------------------------------------------------------
      let ok = false;
      if (looksLikeBcryptHash(row.password_hash)) {
        ok = await bcrypt.compare(password, row.password_hash);
      } else {
        ok = password === row.password_hash;
        if (ok) {
          try {
            const migratedHash = await bcrypt.hash(password, 10);
            await updateAdminUser(row.id, { passwordHash: migratedHash });
          } catch {
            // ignore migration errors; login still succeeds
          }
        }
      }

      if (!ok) {
        return res.status(401).json({ ok: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });
      }

      const token = signAdminJwt({ sub: row.id, role: row.role });
      res.cookie(getCookieName(), token, cookieOptions());
      return res.json({ ok: true, user: row.user });
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: { code: "SERVER_ERROR", message: e?.message || "Server error" } });
    }
  });

  router.post("/auth/logout", async (_req, res) => {
    res.clearCookie(getCookieName(), { path: "/" });
    return res.json({ ok: true });
  });

  router.get("/auth/me", requireAdmin, async (req: AuthedRequest, res) => {
    return res.json({ ok: true, user: req.admin });
  });
}
