import jwt from "jsonwebtoken";
import { getJwtSecret, getCookieMaxAgeMs } from "../config";
import type { UserRole } from "../db/siteUsers";

export type UserJwtPayload = {
  sub: string; // user id
  role: UserRole;
  type: "user"; // distinguish from admin tokens
};

const USER_JWT_SECRET_SUFFIX = "_user_v1";

function getUserSecret() {
  return getJwtSecret() + USER_JWT_SECRET_SUFFIX;
}

export function signUserJwt(payload: Omit<UserJwtPayload, "type">): string {
  const secret = getUserSecret();
  const expiresInSec = Math.floor(getCookieMaxAgeMs() / 1000);
  return jwt.sign({ ...payload, type: "user" }, secret, { expiresIn: expiresInSec });
}

export function verifyUserJwt(token: string): UserJwtPayload {
  const secret = getUserSecret();
  return jwt.verify(token, secret) as UserJwtPayload;
}

export const USER_COOKIE_NAME = "user_session";
