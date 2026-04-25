import pool from "./db";

export async function initDb() {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS detection_sessions (
      id          TEXT PRIMARY KEY,
      image_name  TEXT NOT NULL,
      image_size  INTEGER NOT NULL,
      params      JSONB NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS detections (
      id             TEXT PRIMARY KEY,
      session_id     TEXT REFERENCES detection_sessions(id),
      image_name     TEXT,
      lat            DOUBLE PRECISION NOT NULL DEFAULT 0,
      lng            DOUBLE PRECISION NOT NULL DEFAULT 0,
      confidence     DOUBLE PRECISION NOT NULL,
      elephant_count INTEGER NOT NULL DEFAULT 1,
      bbox           JSONB NOT NULL,
      source_type    TEXT NOT NULL DEFAULT 'drone',
      geom           GEOMETRY(Point, 4326),
      detected_at    TIMESTAMPTZ DEFAULT NOW(),
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS detections_geom_idx
      ON detections USING GIST (geom);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS crossing_zones (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      risk_level  TEXT NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
      polygon     GEOMETRY(Polygon, 4326) NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS crossing_zones_geom_idx
      ON crossing_zones USING GIST (polygon);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS zone_confirmations (
      id              TEXT PRIMARY KEY,
      zone_id         TEXT NOT NULL REFERENCES crossing_zones(id) ON DELETE CASCADE,
      ip_hash         TEXT NOT NULL,
      confirmed_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(zone_id, ip_hash)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS detection_confirmations (
      id              TEXT PRIMARY KEY,
      detection_id    TEXT NOT NULL REFERENCES detections(id) ON DELETE CASCADE,
      ip_hash         TEXT NOT NULL,
      confirmed_at    TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(detection_id, ip_hash)
    );
  `);

  await pool.query(`
    ALTER TABLE crossing_zones
    ADD COLUMN IF NOT EXISTS confirmation_count INTEGER DEFAULT 0;
  `);

  await pool.query(`
    ALTER TABLE detections
    ADD COLUMN IF NOT EXISTS confirmation_count INTEGER DEFAULT 0;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      name          TEXT,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'officer',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS firebase_uid TEXT UNIQUE;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'legacy';
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS users_firebase_uid_idx
      ON users(firebase_uid);
  `);

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
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions(expires_at);
  `);

  console.log("[db-init] Tables ready.");
}
