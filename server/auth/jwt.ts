import jwt from "jsonwebtoken";
import { getCookieMaxAgeMs, getJwtSecret } from "../config";

export type AdminRole = "admin" | "superadmin";

export type AdminJwtPayload = {
  sub: string; // user id
  role: AdminRole;
};

export function signAdminJwt(payload: AdminJwtPayload) {
  const secret = getJwtSecret();
  const expiresInSec = Math.floor(getCookieMaxAgeMs() / 1000);
  return jwt.sign(payload, secret, { expiresIn: expiresInSec });
}

export function verifyAdminJwt(token: string): AdminJwtPayload {
  const secret = getJwtSecret();
  return jwt.verify(token, secret) as AdminJwtPayload;
}
