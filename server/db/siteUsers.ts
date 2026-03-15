import { getPool } from "./pool";

export type UserRole = "pending" | "observer" | "member" | "secretary" | "admin";
export type UserStatus = "pending_approval" | "active" | "rejected" | "deactivated";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  email_consent: boolean;
  reason_for_registration: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  additional_info: string | null;
  reset_token: string | null;
  reset_token_expires: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPublic = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailConsent: boolean;
  phone: string | null;
  address: string | null;
  notes: string | null;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt: string;
};

function toPublic(r: UserRow): UserPublic {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    status: r.status,
    emailConsent: r.email_consent,
    phone: r.phone,
    address: r.address,
    notes: r.notes,
    additionalInfo: r.additional_info,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Create ──
export async function createUser(params: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailConsent: boolean;
  reasonForRegistration?: string;
}): Promise<UserPublic> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    `INSERT INTO users (id, name, email, password_hash, role, status, email_consent, reason_for_registration)
     VALUES ($1, $2, $3, $4, 'pending', 'pending_approval', $5, $6)
     RETURNING *`,
    [params.id, params.name, params.email.toLowerCase(), params.passwordHash, params.emailConsent, params.reasonForRegistration || null]
  );
  return toPublic(res.rows[0]);
}

// ── Find ──
export async function getUserByEmail(email: string): Promise<(UserRow & { public: UserPublic }) | null> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  const row = res.rows[0];
  if (!row) return null;
  return Object.assign(row, { public: toPublic(row) });
}

export async function getUserById(id: string): Promise<UserPublic | null> {
  const pool = getPool();
  const res = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  const row = res.rows[0];
  if (!row) return null;
  return toPublic(row);
}

export async function getUserRowById(id: string): Promise<UserRow | null> {
  const pool = getPool();
  const res = await pool.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0] || null;
}

// ── List ──
export async function listUsers(filters?: { status?: UserStatus; role?: UserRole }): Promise<UserPublic[]> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (filters?.status) {
    conditions.push(`status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters?.role) {
    conditions.push(`role = $${idx++}`);
    values.push(filters.role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query<UserRow>(
    `SELECT * FROM users ${where} ORDER BY created_at DESC`,
    values
  );
  return res.rows.map(toPublic);
}

export async function countUsersByStatus(status: UserStatus): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text as count FROM users WHERE status = $1",
    [status]
  );
  return Number(res.rows[0]?.count || 0);
}

// ── Update ──
export async function updateUser(id: string, patch: {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  passwordHash?: string;
  emailConsent?: boolean;
  phone?: string;
  address?: string;
  notes?: string;
  additionalInfo?: string;
  resetToken?: string | null;
  resetTokenExpires?: string | null;
}): Promise<UserPublic | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (typeof patch.name === "string") { fields.push(`name = $${idx++}`); values.push(patch.name); }
  if (typeof patch.role === "string") { fields.push(`role = $${idx++}`); values.push(patch.role); }
  if (typeof patch.status === "string") { fields.push(`status = $${idx++}`); values.push(patch.status); }
  if (typeof patch.passwordHash === "string") { fields.push(`password_hash = $${idx++}`); values.push(patch.passwordHash); }
  if (typeof patch.emailConsent === "boolean") { fields.push(`email_consent = $${idx++}`); values.push(patch.emailConsent); }
  if (patch.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(patch.phone); }
  if (patch.address !== undefined) { fields.push(`address = $${idx++}`); values.push(patch.address); }
  if (patch.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(patch.notes); }
  if (patch.additionalInfo !== undefined) { fields.push(`additional_info = $${idx++}`); values.push(patch.additionalInfo); }
  if (patch.resetToken !== undefined) { fields.push(`reset_token = $${idx++}`); values.push(patch.resetToken); }
  if (patch.resetTokenExpires !== undefined) { fields.push(`reset_token_expires = $${idx++}`); values.push(patch.resetTokenExpires); }

  fields.push(`updated_at = now()`);
  if (!fields.length) return null;

  values.push(id);
  const res = await pool.query<UserRow>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toPublic(res.rows[0]) : null;
}

export async function deleteUser(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

// ── Reset token ──
export async function getUserByResetToken(token: string): Promise<UserRow | null> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > now()",
    [token]
  );
  return res.rows[0] || null;
}

// ── Observers with email consent ──
export async function getObserversWithEmailConsent(): Promise<UserPublic[]> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "SELECT * FROM users WHERE role = 'observer' AND status = 'active' AND email_consent = true"
  );
  return res.rows.map(toPublic);
}

// ── Active members ──
export async function getActiveMembers(): Promise<UserPublic[]> {
  const pool = getPool();
  const res = await pool.query<UserRow>(
    "SELECT * FROM users WHERE role IN ('member','secretary','admin') AND status = 'active' ORDER BY name"
  );
  return res.rows.map(toPublic);
}
