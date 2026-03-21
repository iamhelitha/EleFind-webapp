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
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      name          TEXT,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'officer',
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log("[db-init] Tables ready.");
}
