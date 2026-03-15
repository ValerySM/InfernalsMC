import { getPool } from "./pool";

export type MemberEventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: "public" | "member";
  date: string;
  time: string | null;
  location: string | null;
  target_group_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberEventPublic = {
  id: string;
  title: string;
  description: string | null;
  eventType: "public" | "member";
  date: string;
  time: string | null;
  location: string | null;
  targetGroupId: string | null;
  targetGroupName?: string | null;
  createdBy: string | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
};

function toPublic(r: any): MemberEventPublic {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    eventType: r.event_type,
    date: r.date,
    time: r.time,
    location: r.location,
    targetGroupId: r.target_group_id,
    targetGroupName: r.group_name || null,
    createdBy: r.created_by,
    createdByName: r.creator_name || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function createMemberEvent(params: {
  id: string;
  title: string;
  description?: string;
  eventType: "public" | "member";
  date: string;
  time?: string;
  location?: string;
  targetGroupId?: string;
  createdBy?: string;
}): Promise<MemberEventPublic> {
  const pool = getPool();
  const res = await pool.query<MemberEventRow>(
    `INSERT INTO member_events (id, title, description, event_type, date, time, location, target_group_id, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [params.id, params.title, params.description || null, params.eventType, params.date,
     params.time || null, params.location || null, params.targetGroupId || null, params.createdBy || null]
  );
  return toPublic(res.rows[0]);
}

export async function listMemberEvents(filters?: { eventType?: string; targetGroupId?: string }): Promise<MemberEventPublic[]> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (filters?.eventType) {
    conditions.push(`me.event_type = $${idx++}`);
    values.push(filters.eventType);
  }
  if (filters?.targetGroupId) {
    conditions.push(`me.target_group_id = $${idx++}`);
    values.push(filters.targetGroupId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query(
    `SELECT me.*, g.name as group_name, u.name as creator_name
     FROM member_events me
     LEFT JOIN groups g ON g.id = me.target_group_id
     LEFT JOIN users u ON u.id = me.created_by
     ${where}
     ORDER BY me.date DESC`,
    values
  );
  return res.rows.map(toPublic);
}

export async function getMemberEventById(id: string): Promise<MemberEventPublic | null> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT me.*, g.name as group_name, u.name as creator_name
     FROM member_events me
     LEFT JOIN groups g ON g.id = me.target_group_id
     LEFT JOIN users u ON u.id = me.created_by
     WHERE me.id = $1`,
    [id]
  );
  return res.rows[0] ? toPublic(res.rows[0]) : null;
}

export async function updateMemberEvent(id: string, patch: {
  title?: string;
  description?: string;
  eventType?: "public" | "member";
  date?: string;
  time?: string;
  location?: string;
  targetGroupId?: string | null;
}): Promise<MemberEventPublic | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (typeof patch.title === "string") { fields.push(`title = $${idx++}`); values.push(patch.title); }
  if (patch.description !== undefined) { fields.push(`description = $${idx++}`); values.push(patch.description); }
  if (typeof patch.eventType === "string") { fields.push(`event_type = $${idx++}`); values.push(patch.eventType); }
  if (typeof patch.date === "string") { fields.push(`date = $${idx++}`); values.push(patch.date); }
  if (patch.time !== undefined) { fields.push(`time = $${idx++}`); values.push(patch.time); }
  if (patch.location !== undefined) { fields.push(`location = $${idx++}`); values.push(patch.location); }
  if (patch.targetGroupId !== undefined) { fields.push(`target_group_id = $${idx++}`); values.push(patch.targetGroupId); }

  fields.push(`updated_at = now()`);
  values.push(id);
  const res = await pool.query<MemberEventRow>(
    `UPDATE member_events SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toPublic(res.rows[0]) : null;
}

export async function deleteMemberEvent(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM member_events WHERE id = $1", [id]);
}

export async function countMemberEvents(): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ count: string }>("SELECT COUNT(*)::text as count FROM member_events");
  return Number(res.rows[0]?.count || 0);
}
