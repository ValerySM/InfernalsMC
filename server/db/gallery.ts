import { getPool } from "./pool";

export type MediaType = "image" | "embed" | "video";

export type GalleryRow = {
  id: string;
  type: MediaType;
  url: string;
  caption: string | null;
  alt: string | null;
  title: string | null;
  sort_order: number;
  created_at: string;
};

export type ApiGalleryItem =
  | { id: string; type: "image"; url: string; alt?: string; caption?: string }
  | { id: string; type: "embed"; url: string; title?: string; caption?: string }
  | { id: string; type: "video"; url: string; title?: string; caption?: string };

function toApi(row: GalleryRow): ApiGalleryItem {
  const caption = row.caption || undefined;
  if (row.type === "image") {
    return {
      id: row.id,
      type: "image",
      url: row.url,
      alt: row.alt || undefined,
      caption,
    };
  }
  if (row.type === "video") {
    return {
      id: row.id,
      type: "video",
      url: row.url,
      title: row.title || undefined,
      caption,
    };
  }
  return {
    id: row.id,
    type: "embed",
    url: row.url,
    title: row.title || undefined,
    caption,
  };
}

export async function listGallery(): Promise<ApiGalleryItem[]> {
  const pool = getPool();
  const res = await pool.query<GalleryRow>(
    "SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC"
  );
  return res.rows.map(toApi);
}

export async function createGalleryItem(params: {
  id: string;
  type: MediaType;
  url: string;
  caption?: string;
  alt?: string;
  title?: string;
  sortOrder?: number;
}) {
  const pool = getPool();
  const res = await pool.query<GalleryRow>(
    `INSERT INTO gallery_items (id, type, url, caption, alt, title, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      params.id,
      params.type,
      params.url,
      params.caption || null,
      params.alt || null,
      params.title || null,
      params.sortOrder ?? 0,
    ]
  );
  return toApi(res.rows[0]);
}

export async function updateGalleryItem(id: string, patch: Partial<{
  caption: string | null;
  alt: string | null;
  title: string | null;
  sortOrder: number;
}>) {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  const set = (col: string, val: any) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };
  if (patch.caption !== undefined) set("caption", patch.caption);
  if (patch.alt !== undefined) set("alt", patch.alt);
  if (patch.title !== undefined) set("title", patch.title);
  if (typeof patch.sortOrder === "number") set("sort_order", patch.sortOrder);
  if (!fields.length) return null;
  values.push(id);
  const res = await pool.query<GalleryRow>(
    `UPDATE gallery_items SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function deleteGalleryItem(id: string) {
  const pool = getPool();
  await pool.query("DELETE FROM gallery_items WHERE id = $1", [id]);
}
