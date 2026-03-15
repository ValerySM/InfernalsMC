import { getPool } from "./pool";

export type SiteContentRow = {
  key: string;
  value: string;
  updated_at: string;
};

/**
 * Get a single content value by key.
 */
export async function getContentValue(key: string): Promise<string | null> {
  const pool = getPool();
  const res = await pool.query<SiteContentRow>(
    "SELECT value FROM site_content WHERE key = $1",
    [key]
  );
  return res.rows[0]?.value ?? null;
}

/**
 * Get multiple content values by keys. Returns a map.
 */
export async function getContentValues(keys: string[]): Promise<Record<string, string>> {
  if (!keys.length) return {};
  const pool = getPool();
  const res = await pool.query<SiteContentRow>(
    "SELECT key, value FROM site_content WHERE key = ANY($1)",
    [keys]
  );
  const map: Record<string, string> = {};
  for (const row of res.rows) {
    map[row.key] = row.value;
  }
  return map;
}

/**
 * Get ALL content values. Returns a map.
 */
export async function getAllContent(): Promise<Record<string, string>> {
  const pool = getPool();
  const res = await pool.query<SiteContentRow>("SELECT key, value FROM site_content ORDER BY key");
  const map: Record<string, string> = {};
  for (const row of res.rows) {
    map[row.key] = row.value;
  }
  return map;
}

/**
 * Upsert a single content value.
 */
export async function setContentValue(key: string, value: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO site_content (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
    [key, value]
  );
}

/**
 * Upsert multiple content values at once.
 */
export async function setContentValues(entries: Record<string, string>): Promise<void> {
  const pool = getPool();
  for (const [key, value] of Object.entries(entries)) {
    await pool.query(
      `INSERT INTO site_content (key, value, updated_at)
       VALUES ($1, $2, now())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
      [key, value]
    );
  }
}

/**
 * Delete a content key.
 */
export async function deleteContentValue(key: string): Promise<void> {
  const pool = getPool();
  await pool.query("DELETE FROM site_content WHERE key = $1", [key]);
}
