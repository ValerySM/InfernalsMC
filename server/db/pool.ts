import { Pool } from "pg";
import { getDatabaseUrl, isProd } from "../config";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: isProd() && process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
    max: Number(process.env.PGPOOL_MAX || 10),
  });
  return pool;
}
