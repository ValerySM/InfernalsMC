import { getPool } from "./pool";

export type EventCategory = "event" | "training" | "organized";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  date: string; // DATE comes as string
  time: string | null;
  location: string | null;
  short_description: string;
  description: string;
  category: EventCategory;
  tags: string[];
  cover_url: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MediaType = "image" | "embed" | "video";

export type EventMediaRow = {
  id: string;
  event_id: string;
  type: MediaType;
  url: string;
  alt: string | null;
  title: string | null;
  sort_order: number;
  created_at: string;
};

export type ApiEvent = {
  id: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  tags: string[];
  cover?: string;
  media?: Array<
    | { type: "image"; url: string; alt?: string }
    | { type: "embed"; url: string; title?: string }
    | { type: "video"; url: string; title?: string }
  >;
  externalUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

function toApiEvent(row: EventRow, media: EventMediaRow[] = []): ApiEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    time: row.time || undefined,
    location: row.location || undefined,
    shortDescription: row.short_description,
    description: row.description,
    category: row.category,
    tags: row.tags || [],
    cover: row.cover_url || undefined,
    externalUrl: row.external_url || undefined,
    media: media.length
      ? media
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(m => {
            if (m.type === "image") {
              return { type: "image" as const, url: m.url, alt: m.alt || undefined };
            }
            if (m.type === "video") {
              return { type: "video" as const, url: m.url, title: m.title || undefined };
            }
            return { type: "embed" as const, url: m.url, title: m.title || undefined };
          })
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listEvents(params?: { category?: EventCategory }): Promise<ApiEvent[]> {
  const pool = getPool();
  const values: any[] = [];
  let where = "";
  if (params?.category) {
    values.push(params.category);
    where = `WHERE category = $${values.length}`;
  }
  const res = await pool.query<EventRow>(
    `SELECT * FROM events ${where} ORDER BY date DESC, time DESC NULLS LAST, created_at DESC`,
    values
  );

  // For list view we don't need full media. Keep it light.
  return res.rows.map(r => toApiEvent(r));
}

export async function getEventById(id: string): Promise<(ApiEvent & { mediaRows: EventMediaRow[] }) | null> {
  const pool = getPool();
  const res = await pool.query<EventRow>("SELECT * FROM events WHERE id = $1", [id]);
  const row = res.rows[0];
  if (!row) return null;
  const mediaRes = await pool.query<EventMediaRow>(
    "SELECT * FROM event_media WHERE event_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [id]
  );
  const media = mediaRes.rows;
  return Object.assign(toApiEvent(row, media), { mediaRows: media });
}

export async function getEventBySlug(slug: string): Promise<ApiEvent | null> {
  const pool = getPool();
  const res = await pool.query<EventRow>("SELECT * FROM events WHERE slug = $1", [slug]);
  const row = res.rows[0];
  if (!row) return null;
  const mediaRes = await pool.query<EventMediaRow>(
    "SELECT * FROM event_media WHERE event_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [row.id]
  );
  return toApiEvent(row, mediaRes.rows);
}

export async function createEvent(e: {
  id: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  tags: string[];
  cover?: string;
  externalUrl?: string;
}): Promise<ApiEvent> {
  const pool = getPool();
  const res = await pool.query<EventRow>(
    `INSERT INTO events (id, slug, title, date, time, location, short_description, description, category, tags, cover_url, external_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      e.id,
      e.slug,
      e.title,
      e.date,
      e.time || null,
      e.location || null,
      e.shortDescription,
      e.description,
      e.category,
      e.tags,
      e.cover || null,
      e.externalUrl || null,
    ]
  );
  return toApiEvent(res.rows[0]);
}

export async function updateEvent(id: string, patch: Partial<{
  slug: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  shortDescription: string;
  description: string;
  category: EventCategory;
  tags: string[];
  cover: string | null;
  externalUrl: string | null;
}>): Promise<ApiEvent | null> {
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
  if (typeof patch.date === "string") set("date", patch.date);
  if (patch.time !== undefined) set("time", patch.time);
  if (patch.location !== undefined) set("location", patch.location);
  if (typeof patch.shortDescription === "string") set("short_description", patch.shortDescription);
  if (typeof patch.description === "string") set("description", patch.description);
  if (typeof patch.category === "string") set("category", patch.category);
  if (Array.isArray(patch.tags)) set("tags", patch.tags);
  if (patch.cover !== undefined) set("cover_url", patch.cover);
  if (patch.externalUrl !== undefined) set("external_url", patch.externalUrl);

  if (!fields.length) return await getEventById(id).then(x => (x ? (x as any) : null));
  fields.push("updated_at = now()");
  values.push(id);

  const res = await pool.query<EventRow>(
    `UPDATE events SET ${fields.join(", ")}
     WHERE id = $${idx}
     RETURNING *`,
    values
  );
  const row = res.rows[0];
  if (!row) return null;
  return toApiEvent(row);
}

export async function deleteEvent(id: string) {
  const pool = getPool();
  await pool.query("DELETE FROM events WHERE id = $1", [id]);
}

export async function setEventCoverUrl(eventId: string, coverUrl: string | null) {
  return updateEvent(eventId, { cover: coverUrl });
}

export async function addEventMedia(params: {
  id: string;
  eventId: string;
  type: MediaType;
  url: string;
  alt?: string;
  title?: string;
  sortOrder?: number;
}) {
  const pool = getPool();
  const sortOrder = typeof params.sortOrder === "number" ? params.sortOrder : 0;
  const res = await pool.query<EventMediaRow>(
    `INSERT INTO event_media (id, event_id, type, url, alt, title, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      params.id,
      params.eventId,
      params.type,
      params.url,
      params.alt || null,
      params.title || null,
      sortOrder,
    ]
  );
  return res.rows[0];
}

export async function deleteMedia(mediaId: string) {
  const pool = getPool();
  await pool.query("DELETE FROM event_media WHERE id = $1", [mediaId]);
}

export async function reorderEventMedia(eventId: string, orderedIds: string[]) {
  const pool = getPool();
  // Minimal, safe update: iterate. (The number of items is small.)
  let order = 0;
  for (const id of orderedIds) {
    await pool.query(
      "UPDATE event_media SET sort_order = $1 WHERE id = $2 AND event_id = $3",
      [order++, id, eventId]
    );
  }
}
