-- ─────────────────────────────────────────────────────────────────────────────
-- MyAir API — SQLite Schema (same pattern as FoodSafe)
-- ─────────────────────────────────────────────────────────────────────────────

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;

-- ─── Readings (air quality, radiation, etc.) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS readings (
  id              TEXT PRIMARY KEY,
  source          TEXT NOT NULL CHECK(source IN ('airnow','radnet','copernicus','tri','usgs_water')),
  source_id       TEXT NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL DEFAULT '',
  location_name   TEXT,
  location_zip    TEXT,
  latitude        REAL,
  longitude       REAL,
  value           REAL,
  unit            TEXT,
  category        TEXT NOT NULL DEFAULT 'unknown',
  observed_at     TEXT,
  source_url      TEXT,
  raw_json        TEXT NOT NULL DEFAULT '{}',
  content_hash    TEXT NOT NULL,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source, source_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS readings_fts USING fts5(
  title, summary, location_name, category,
  content='readings', content_rowid='rowid'
);

CREATE TRIGGER IF NOT EXISTS readings_fts_insert AFTER INSERT ON readings BEGIN
  INSERT INTO readings_fts(rowid, title, summary, location_name, category)
  VALUES (new.rowid, new.title, new.summary, new.location_name, new.category);
END;
CREATE TRIGGER IF NOT EXISTS readings_fts_update AFTER UPDATE ON readings BEGIN
  INSERT INTO readings_fts(readings_fts, rowid, title, summary, location_name, category)
  VALUES ('delete', old.rowid, old.title, old.summary, old.location_name, old.category);
  INSERT INTO readings_fts(rowid, title, summary, location_name, category)
  VALUES (new.rowid, new.title, new.summary, new.location_name, new.category);
END;
CREATE TRIGGER IF NOT EXISTS readings_fts_delete AFTER DELETE ON readings BEGIN
  INSERT INTO readings_fts(readings_fts, rowid, title, summary, location_name, category)
  VALUES ('delete', old.rowid, old.title, old.summary, old.location_name, old.category);
END;

CREATE INDEX IF NOT EXISTS idx_readings_source      ON readings(source);
CREATE INDEX IF NOT EXISTS idx_readings_category    ON readings(category);
CREATE INDEX IF NOT EXISTS idx_readings_observed     ON readings(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_content_hash ON readings(content_hash);

-- ─── Sync jobs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_jobs (
  id               TEXT PRIMARY KEY,
  source           TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','success','error')),
  started_at       TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at      TEXT,
  records_added    INTEGER NOT NULL DEFAULT 0,
  records_updated  INTEGER NOT NULL DEFAULT 0,
  records_removed  INTEGER NOT NULL DEFAULT 0,
  error_message    TEXT,
  snapshot_files   TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_jobs_status   ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_source   ON sync_jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_started  ON sync_jobs(started_at DESC);

-- ─── Diff log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diff_log (
  id           TEXT PRIMARY KEY,
  job_id       TEXT NOT NULL REFERENCES sync_jobs(id),
  source       TEXT NOT NULL,
  source_id    TEXT NOT NULL,
  action       TEXT NOT NULL CHECK(action IN ('added','updated','removed')),
  old_hash     TEXT,
  new_hash     TEXT,
  changed_at   TEXT NOT NULL DEFAULT (datetime('now')),
  summary      TEXT
);
CREATE INDEX IF NOT EXISTS idx_diff_job       ON diff_log(job_id);
CREATE INDEX IF NOT EXISTS idx_diff_source_id ON diff_log(source, source_id);
CREATE INDEX IF NOT EXISTS idx_diff_changed   ON diff_log(changed_at DESC);

-- Users & auth (expandable)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin','debug')), usage_limit INTEGER NOT NULL DEFAULT 10000,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS api_usage (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), period_start TEXT NOT NULL, request_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, period_start)
);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON api_usage(user_id, period_start);
