import { getPool } from "./pool";
import type { AdminRole } from "../auth/jwt";
import type { AdminUser } from "../auth/middleware";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function toAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active,
  };
}

export async function getAdminUserByEmail(email: string): Promise<(AdminUserRow & { user: AdminUser }) | null> {
  const pool = getPool();
  const res = await pool.query<AdminUserRow>(
    "SELECT * FROM admin_users WHERE email = $1",
    [email.toLowerCase()]
  );
  const row = res.rows[0];
  if (!row) return null;
  return Object.assign(row, { user: toAdminUser(row) });
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const pool = getPool();
  const res = await pool.query<AdminUserRow>(
    "SELECT * FROM admin_users WHERE id = $1",
    [id]
  );
  const row = res.rows[0];
  if (!row) return null;
  return toAdminUser(row);
}

export async function listAdminUsers(): Promise<Array<AdminUser & { createdAt: string; updatedAt: string }>> {
  const pool = getPool();
  const res = await pool.query<AdminUserRow>(
    "SELECT * FROM admin_users ORDER BY created_at DESC"
  );
  return res.rows.map(r => ({
    ...toAdminUser(r),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function createAdminUser(params: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
}) {
  const pool = getPool();
  const res = await pool.query<AdminUserRow>(
    `INSERT INTO admin_users (id, email, name, password_hash, role, is_active)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      params.id,
      params.email.toLowerCase(),
      params.name,
      params.passwordHash,
      params.role,
      params.isActive,
    ]
  );
  return res.rows[0];
}

export async function updateAdminUser(id: string, patch: {
  name?: string;
  role?: AdminRole;
  passwordHash?: string;
  isActive?: boolean;
}) {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (typeof patch.name === "string") {
    fields.push(`name = $${idx++}`);
    values.push(patch.name);
  }
  if (typeof patch.role === "string") {
    fields.push(`role = $${idx++}`);
    values.push(patch.role);
  }
  if (typeof patch.passwordHash === "string") {
    fields.push(`password_hash = $${idx++}`);
    values.push(patch.passwordHash);
  }
  if (typeof patch.isActive === "boolean") {
    fields.push(`is_active = $${idx++}`);
    values.push(patch.isActive);
  }

  fields.push(`updated_at = now()`);

  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query<AdminUserRow>(
    `UPDATE admin_users SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  return res.rows[0] || null;
}

export async function deleteAdminUser(id: string) {
  const pool = getPool();
  await pool.query("DELETE FROM admin_users WHERE id = $1", [id]);
}
