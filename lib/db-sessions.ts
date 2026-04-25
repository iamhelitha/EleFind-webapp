import pool from "./db";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 5; // 5 days
export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000;

export interface DbSession {
  user_id: string;
  firebase_uid: string;
  email: string;
  name: string | null;
  role: string;
}

let schemaEnsured = false;

async function ensureSessionsTable(): Promise<void> {
  if (schemaEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token        TEXT PRIMARY KEY,
      user_id      TEXT NOT NULL,
      firebase_uid TEXT NOT NULL,
      email        TEXT NOT NULL,
      name         TEXT,
      role         TEXT NOT NULL,
      expires_at   TIMESTAMPTZ NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at)`
  );
  schemaEnsured = true;
}

export async function createSession(params: {
  userId: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  role: string;
}): Promise<string> {
  await ensureSessionsTable();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.query(
    `INSERT INTO sessions (token, user_id, firebase_uid, email, name, role, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [token, params.userId, params.firebaseUid, params.email, params.name, params.role, expiresAt]
  );

  return token;
}

export async function getSession(token: string): Promise<DbSession | null> {
  await ensureSessionsTable();
  const result = await pool.query(
    `SELECT user_id, firebase_uid, email, name, role
     FROM sessions
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) return null;
  return result.rows[0] as DbSession;
}

export async function deleteSession(token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
}
