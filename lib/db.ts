import { Pool } from "pg";

const globalForPg = globalThis as unknown as { pool: Pool };

function getDatabaseConnectionString(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }

  // Rely on explicit pg ssl options below instead of parsing sslmode from URL.
  const parsed = new URL(raw);
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("uselibpqcompat");
  return parsed.toString();
}

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: getDatabaseConnectionString(),
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForPg.pool = pool;

export default pool;
