import { getPool } from "./pool";

export type GroupRow = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type GroupPublic = {
  id: string;
  name: string;
  description: string | null;
  createdBy: string | null;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
};

function toPublic(r: GroupRow, memberCount?: number): GroupPublic {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    createdBy: r.created_by,
    memberCount,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function createGroup(params: { id: string; name: string; description?: string; createdBy?: string }): Promise<GroupPublic> {
  const pool = getPool();
  const res = await pool.query<GroupRow>(
    `INSERT INTO groups (id, name, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [params.id, params.name, params.description || null, params.createdBy || null]
  );
  return toPublic(res.rows[0], 0);
}

export async function listGroups(): Promise<GroupPublic[]> {
  const pool = getPool();
  const res = await pool.query<GroupRow & { member_count: string }>(
    `SELECT g.*, COALESCE(mc.cnt, 0)::text as member_count
     FROM groups g
     LEFT JOIN (SELECT group_id, COUNT(*) as cnt FROM group_members GROUP BY group_id) mc ON mc.group_id = g.id
     ORDER BY g.name`
  );
  return res.rows.map(r => toPublic(r, Number(r.member_count || 0)));
}

export async function getGroupById(id: string): Promise<GroupPublic | null> {
  const pool = getPool();
  const res = await pool.query<GroupRow>(
    "SELECT * FROM groups WHERE id = $1", [id]
  );
  if (!res.rows[0]) return null;
  return toPublic(res.rows[0]);
}

export async function updateGroup(id: string, patch: { name?: string; description?: string }): Promise<GroupPublic | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (typeof patch.name === "string") { fields.push(`name = $${idx++}`); values.push(patch.name); }
  if (patch.description !== undefined) { fields.push(`description = $${idx++}`); values.push(patch.description); }
  fields.push(`updated_at = now()`);
  values.push(id);
  const res = await pool.query<GroupRow>(
    `UPDATE groups SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toPublic(res.rows[0]) : null;
}

export async function deleteGroup(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM groups WHERE id = $1", [id]);
}

// ── Group Members ──
export async function addGroupMember(params: { id: string; groupId: string; userId: string }): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO group_members (id, group_id, user_id) VALUES ($1, $2, $3) ON CONFLICT (group_id, user_id) DO NOTHING`,
    [params.id, params.groupId, params.userId]
  );
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM group_members WHERE group_id = $1 AND user_id = $2", [groupId, userId]);
}

export async function getGroupMembers(groupId: string): Promise<Array<{ userId: string; name: string; email: string; role: string }>> {
  const pool = getPool();
  const res = await pool.query<{ user_id: string; name: string; email: string; role: string }>(
    `SELECT gm.user_id, u.name, u.email, u.role
     FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = $1
     ORDER BY u.name`,
    [groupId]
  );
  return res.rows.map(r => ({ userId: r.user_id, name: r.name, email: r.email, role: r.role }));
}

export async function getUserGroups(userId: string): Promise<GroupPublic[]> {
  const pool = getPool();
  const res = await pool.query<GroupRow>(
    `SELECT g.* FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = $1 ORDER BY g.name`,
    [userId]
  );
  return res.rows.map(r => toPublic(r));
}
