import pool from "@/lib/db";

export interface SyncedDbUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface SyncFirebaseUserInput {
  firebaseUid: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  provider: string;
}

let ensureUserSchemaPromise: Promise<void> | null = null;

async function ensureUsersTableColumns(): Promise<void> {
  if (!ensureUserSchemaPromise) {
    ensureUserSchemaPromise = (async () => {
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'legacy'");
      await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ");
      await pool.query("CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users(firebase_uid)");
    })();
  }

  await ensureUserSchemaPromise;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function syncFirebaseUserToDb(input: SyncFirebaseUserInput): Promise<SyncedDbUser> {
  await ensureUsersTableColumns();

  const email = normalizeEmail(input.email);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingByEmail = await client.query(
      `SELECT id, email, name, role, firebase_uid
       FROM users
       WHERE email = $1
       FOR UPDATE`,
      [email]
    );

    if (existingByEmail.rows.length > 0) {
      const existing = existingByEmail.rows[0] as {
        id: string;
        email: string;
        name: string | null;
        role: string;
        firebase_uid: string | null;
      };

      if (existing.firebase_uid && existing.firebase_uid !== input.firebaseUid) {
        throw new Error("ACCOUNT_LINK_CONFLICT");
      }

      const updateResult = await client.query(
        `UPDATE users
         SET firebase_uid = COALESCE(firebase_uid, $1),
             name = COALESCE(name, $2),
             email_verified = $3,
             auth_provider = $4,
             last_login_at = NOW()
         WHERE id = $5
         RETURNING id, email, name, role`,
        [
          input.firebaseUid,
          input.name,
          input.emailVerified,
          input.provider,
          existing.id,
        ]
      );

      await client.query("COMMIT");
      return updateResult.rows[0] as SyncedDbUser;
    }

    const inserted = await client.query(
      `INSERT INTO users (
         id,
         email,
         name,
         password_hash,
         role,
         firebase_uid,
         email_verified,
         auth_provider,
         last_login_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id, email, name, role`,
      [
        crypto.randomUUID(),
        email,
        input.name,
        "firebase-auth",
        "public",
        input.firebaseUid,
        input.emailVerified,
        input.provider,
      ]
    );

    await client.query("COMMIT");
    return inserted.rows[0] as SyncedDbUser;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
