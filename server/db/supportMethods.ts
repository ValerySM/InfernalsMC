import { getPool } from "./pool";

export type SupportMethodRow = {
  id: string;
  title: string;
  description: string | null;
  link: string | null;
  qr_image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ApiSupportMethod = {
  id: string;
  title: string;
  description?: string;
  link?: string;
  qrImage?: string;
  sortOrder: number;
};

function toApi(row: SupportMethodRow): ApiSupportMethod {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    link: row.link || undefined,
    qrImage: row.qr_image_url || undefined,
    sortOrder: row.sort_order,
  };
}

export async function listSupportMethods(): Promise<ApiSupportMethod[]> {
  const pool = getPool();
  const res = await pool.query<SupportMethodRow>(
    "SELECT * FROM support_methods ORDER BY sort_order ASC, created_at ASC"
  );
  return res.rows.map(toApi);
}

export async function getSupportMethodById(id: string): Promise<ApiSupportMethod | null> {
  const pool = getPool();
  const res = await pool.query<SupportMethodRow>("SELECT * FROM support_methods WHERE id = $1", [id]);
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function createSupportMethod(params: {
  id: string;
  title: string;
  description?: string;
  link?: string;
  qrImageUrl?: string;
  sortOrder?: number;
}): Promise<ApiSupportMethod> {
  const pool = getPool();
  const res = await pool.query<SupportMethodRow>(
    `INSERT INTO support_methods (id, title, description, link, qr_image_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      params.id,
      params.title,
      params.description || null,
      params.link || null,
      params.qrImageUrl || null,
      params.sortOrder ?? 0,
    ]
  );
  return toApi(res.rows[0]);
}

export async function updateSupportMethod(
  id: string,
  patch: Partial<{
    title: string;
    description: string | null;
    link: string | null;
    qrImageUrl: string | null;
    sortOrder: number;
  }>
): Promise<ApiSupportMethod | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const set = (col: string, val: any) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };

  if (typeof patch.title === "string") set("title", patch.title);
  if (patch.description !== undefined) set("description", patch.description);
  if (patch.link !== undefined) set("link", patch.link);
  if (patch.qrImageUrl !== undefined) set("qr_image_url", patch.qrImageUrl);
  if (typeof patch.sortOrder === "number") set("sort_order", patch.sortOrder);

  if (!fields.length) return getSupportMethodById(id);
  fields.push("updated_at = now()");
  values.push(id);

  const res = await pool.query<SupportMethodRow>(
    `UPDATE support_methods SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function deleteSupportMethod(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM support_methods WHERE id = $1", [id]);
}
