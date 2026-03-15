import type { NextFunction, Request, Response } from "express";
import { getCookieName } from "../config";
import { verifyAdminJwt, type AdminRole } from "./jwt";
import { getAdminUserById } from "../db/users";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
};

declare global {
  // eslint-disable-next-line no-var
  var __adminUserHack: unknown;
}

export type AuthedRequest = Request & { admin?: AdminUser };

function send401(res: Response) {
  res.status(401).json({ ok: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
}

function send403(res: Response) {
  res.status(403).json({ ok: false, error: { code: "FORBIDDEN", message: "Forbidden" } });
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = (req.cookies?.[getCookieName()] || "") as string;
    if (!token) return send401(res);
    const payload = verifyAdminJwt(token);
    const user = await getAdminUserById(payload.sub);
    if (!user || !user.isActive) return send401(res);
    req.admin = user;
    return next();
  } catch {
    return send401(res);
  }
}

export function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.admin) return send401(res);
  if (req.admin.role !== "superadmin") return send403(res);
  return next();
}
