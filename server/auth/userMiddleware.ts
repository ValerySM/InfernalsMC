import type { NextFunction, Request, Response } from "express";
import { verifyUserJwt, USER_COOKIE_NAME } from "./userJwt";
import { getUserById, type UserPublic } from "../db/siteUsers";

export type UserAuthedRequest = Request & { siteUser?: UserPublic };

function send401(res: Response) {
  res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
}

function send403(res: Response, msg = "Forbidden") {
  res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: msg } });
}

/** Require any authenticated active user */
export async function requireUser(req: UserAuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = (req.cookies?.[USER_COOKIE_NAME] || "") as string;
    if (!token) return send401(res);
    const payload = verifyUserJwt(token);
    const user = await getUserById(payload.sub);
    if (!user || user.status !== "active") return send401(res);
    req.siteUser = user;
    return next();
  } catch {
    return send401(res);
  }
}

/** Require at least member role (member, secretary, admin) */
export function requireMember(req: UserAuthedRequest, res: Response, next: NextFunction) {
  if (!req.siteUser) return send401(res);
  if (!["member", "secretary", "admin"].includes(req.siteUser.role)) {
    return send403(res, "Members only");
  }
  return next();
}

/** Require secretary or admin role */
export function requireSecretary(req: UserAuthedRequest, res: Response, next: NextFunction) {
  if (!req.siteUser) return send401(res);
  if (!["secretary", "admin"].includes(req.siteUser.role)) {
    return send403(res, "Secretary access required");
  }
  return next();
}

/** Require site admin role */
export function requireSiteAdmin(req: UserAuthedRequest, res: Response, next: NextFunction) {
  if (!req.siteUser) return send401(res);
  if (req.siteUser.role !== "admin") {
    return send403(res, "Admin access required");
  }
  return next();
}

/** Optional user — attach if present but don't block */
export async function optionalUser(req: UserAuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = (req.cookies?.[USER_COOKIE_NAME] || "") as string;
    if (token) {
      const payload = verifyUserJwt(token);
      const user = await getUserById(payload.sub);
      if (user && user.status === "active") {
        req.siteUser = user;
      }
    }
  } catch {
    // ignore
  }
  return next();
}
