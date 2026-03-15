import { getPool } from "./pool";

export type ArtProjectRow = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  tags: string[];
  cover_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ArtProjectMediaRow = {
  id: string;
  project_id: string;
  type: "image" | "embed" | "video";
  url: string;
  alt: string | null;
  title: string | null;
  sort_order: number;
  created_at: string;
};

export type ApiArtProject = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  cover?: string;
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "embed"; url: string; title?: string }
    | { type: "video"; url: string; title?: string }
  >;
  sortOrder: number;
};

function toApi(row: ArtProjectRow, media: ArtProjectMediaRow[] = []): ApiArtProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    tags: row.tags || [],
    cover: row.cover_url || undefined,
    sortOrder: row.sort_order,
    media: media.length
      ? media
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(m => {
            if (m.type === "image") return { type: "image" as const, url: m.url, alt: m.alt || undefined };
            if (m.type === "video") return { type: "video" as const, url: m.url, title: m.title || undefined };
            return { type: "embed" as const, url: m.url, title: m.title || undefined };
          })
      : undefined,
  };
}

export async function listArtProjects(): Promise<ApiArtProject[]> {
  const pool = getPool();
  const res = await pool.query<ArtProjectRow>(
    "SELECT * FROM art_projects ORDER BY sort_order ASC, created_at DESC"
  );
  return res.rows.map(r => toApi(r));
}

export async function getArtProjectById(id: string): Promise<(ApiArtProject & { mediaRows: ArtProjectMediaRow[] }) | null> {
  const pool = getPool();
  const res = await pool.query<ArtProjectRow>("SELECT * FROM art_projects WHERE id = $1", [id]);
  const row = res.rows[0];
  if (!row) return null;
  const mediaRes = await pool.query<ArtProjectMediaRow>(
    "SELECT * FROM art_project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [id]
  );
  return Object.assign(toApi(row, mediaRes.rows), { mediaRows: mediaRes.rows });
}

export async function getArtProjectBySlug(slug: string): Promise<ApiArtProject | null> {
  const pool = getPool();
  const res = await pool.query<ArtProjectRow>("SELECT * FROM art_projects WHERE slug = $1", [slug]);
  const row = res.rows[0];
  if (!row) return null;
  const mediaRes = await pool.query<ArtProjectMediaRow>(
    "SELECT * FROM art_project_media WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [row.id]
  );
  return toApi(row, mediaRes.rows);
}

export async function createArtProject(params: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  cover?: string;
  sortOrder?: number;
}): Promise<ApiArtProject> {
  const pool = getPool();
  const res = await pool.query<ArtProjectRow>(
    `INSERT INTO art_projects (id, slug, title, short_description, description, tags, cover_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      params.id,
      params.slug,
      params.title,
      params.shortDescription,
      params.description,
      params.tags,
      params.cover || null,
      params.sortOrder ?? 0,
    ]
  );
  return toApi(res.rows[0]);
}

export async function updateArtProject(
  id: string,
  patch: Partial<{
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    tags: string[];
    cover: string | null;
    sortOrder: number;
  }>
): Promise<ApiArtProject | null> {
  const pool = getPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  const set = (col: string, val: any) => {
    fields.push(`${col} = $${idx++}`);
    values.push(val);
  };

  if (typeof patch.slug === "string") set("slug", patch.slug);
  if (typeof patch.title === "string") set("title", patch.title);
  if (typeof patch.shortDescription === "string") set("short_description", patch.shortDescription);
  if (typeof patch.description === "string") set("description", patch.description);
  if (Array.isArray(patch.tags)) set("tags", patch.tags);
  if (patch.cover !== undefined) set("cover_url", patch.cover);
  if (typeof patch.sortOrder === "number") set("sort_order", patch.sortOrder);

  if (!fields.length) return getArtProjectById(id);
  fields.push("updated_at = now()");
  values.push(id);

  const res = await pool.query<ArtProjectRow>(
    `UPDATE art_projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] ? toApi(res.rows[0]) : null;
}

export async function deleteArtProject(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM art_projects WHERE id = $1", [id]);
}

export async function setArtProjectCover(projectId: string, coverUrl: string | null) {
  return updateArtProject(projectId, { cover: coverUrl });
}

export async function addArtProjectMedia(params: {
  id: string;
  projectId: string;
  type: "image" | "embed" | "video";
  url: string;
  alt?: string;
  title?: string;
  sortOrder?: number;
}) {
  const pool = getPool();
  const res = await pool.query<ArtProjectMediaRow>(
    `INSERT INTO art_project_media (id, project_id, type, url, alt, title, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      params.id,
      params.projectId,
      params.type,
      params.url,
      params.alt || null,
      params.title || null,
      params.sortOrder ?? 0,
    ]
  );
  return res.rows[0];
}

export async function deleteArtProjectMedia(mediaId: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM art_project_media WHERE id = $1", [mediaId]);
}

export async function reorderArtProjectMedia(projectId: string, orderedIds: string[]): Promise<void> {
  const pool = getPool();
  let order = 0;
  for (const id of orderedIds) {
    await pool.query(
      "UPDATE art_project_media SET sort_order = $1 WHERE id = $2 AND project_id = $3",
      [order++, id, projectId]
    );
  }
}
