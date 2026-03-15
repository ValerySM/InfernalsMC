import { getPool } from "./pool";

export type MemberRow = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ApiMember = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  sortOrder: number;
};

function toApi(row: MemberRow): ApiMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    photoUrl: row.photo_url || undefined,
    sortOrder: row.sort_order,
  };
}

export async function listMembers(): Promise<ApiMember[]> {
  const pool = getPool();
  const res = await pool.query<MemberRow>(
    "SELECT * FROM club_members ORDER BY sort_order ASC, created_at ASC"
  );
  return res.rows.map(toApi);
}

export async function getMemberById(id: string): Promise<ApiMember | null> {
  const pool = getPool();
  const res = await pool.query<MemberRow>("SELECT * FROM club_members WHERE id = $1", [id]);
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function createMember(params: {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  sortOrder?: number;
}): Promise<ApiMember> {
  const pool = getPool();
  const res = await pool.query<MemberRow>(
    `INSERT INTO club_members (id, name, role, photo_url, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [params.id, params.name, params.role, params.photoUrl || null, params.sortOrder ?? 0]
  );
  return toApi(res.rows[0]);
}

export async function updateMember(
  id: string,
  patch: Partial<{
    name: string;
    role: string;
    photoUrl: string | null;
    sortOrder: number;
  }>
): Promise<ApiMember | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const set = (col: string, val: any) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };

  if (typeof patch.name === "string") set("name", patch.name);
  if (typeof patch.role === "string") set("role", patch.role);
  if (patch.photoUrl !== undefined) set("photo_url", patch.photoUrl);
  if (typeof patch.sortOrder === "number") set("sort_order", patch.sortOrder);

  if (!fields.length) return getMemberById(id);
  fields.push("updated_at = now()");
  values.push(id);

  const res = await pool.query<MemberRow>(
    `UPDATE club_members SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function deleteMember(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM club_members WHERE id = $1", [id]);
}

export async function reorderMembers(orderedIds: string[]): Promise<void> {
  const pool = getPool();
  let order = 0;
  for (const id of orderedIds) {
    await pool.query(
      "UPDATE club_members SET sort_order = $1, updated_at = now() WHERE id = $2",
      [order++, id]
    );
  }
}
