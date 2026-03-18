-- ─────────────────────────────────────────────────────────────────────────────
-- FoodSafe API — SQLite Schema
-- Designed for easy migration to PostgreSQL:
--   - No SQLite-specific types (using TEXT for JSON, booleans as INTEGER)
--   - All timestamps as ISO 8601 TEXT
--   - UUIDs as TEXT
-- ─────────────────────────────────────────────────────────────────────────────

PRAGMA journal_mode = WAL;       -- enables concurrent reads during writes
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;     -- safe + faster than FULL for this use case

-- ─── Recalls ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recalls (
  id                          TEXT PRIMARY KEY,
  source                      TEXT NOT NULL CHECK(source IN ('fda','usda','cdc','foodsafety')),
  source_id                   TEXT NOT NULL,
  title                       TEXT NOT NULL,
  reason                      TEXT NOT NULL DEFAULT '',
  classification              TEXT NOT NULL DEFAULT 'unknown',
  status                      TEXT NOT NULL DEFAULT 'unknown',
  recalling_firm              TEXT NOT NULL DEFAULT '',
  product_description         TEXT NOT NULL DEFAULT '',
  product_quantity            TEXT,
  distribution_pattern        TEXT,
  states_affected             TEXT NOT NULL DEFAULT '[]',   -- JSON array
  recall_initiation_date      TEXT,
  termination_date            TEXT,
  center_classification_date  TEXT,
  report_date                 TEXT,
  source_url                  TEXT,
  raw_json                    TEXT NOT NULL DEFAULT '{}',
  content_hash                TEXT NOT NULL,
  created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                  TEXT NOT NULL DEFAULT (datetime('now')),

  UNIQUE(source, source_id)
);

-- Full-text search virtual table over the fields users will search
CREATE VIRTUAL TABLE IF NOT EXISTS recalls_fts USING fts5(
  title,
  reason,
  recalling_firm,
  product_description,
  content='recalls',
  content_rowid='rowid'
);

-- Keep FTS in sync via triggers
CREATE TRIGGER IF NOT EXISTS recalls_fts_insert AFTER INSERT ON recalls BEGIN
  INSERT INTO recalls_fts(rowid, title, reason, recalling_firm, product_description)
  VALUES (new.rowid, new.title, new.reason, new.recalling_firm, new.product_description);
END;

CREATE TRIGGER IF NOT EXISTS recalls_fts_update AFTER UPDATE ON recalls BEGIN
  INSERT INTO recalls_fts(recalls_fts, rowid, title, reason, recalling_firm, product_description)
  VALUES ('delete', old.rowid, old.title, old.reason, old.recalling_firm, old.product_description);
  INSERT INTO recalls_fts(rowid, title, reason, recalling_firm, product_description)
  VALUES (new.rowid, new.title, new.reason, new.recalling_firm, new.product_description);
END;

CREATE TRIGGER IF NOT EXISTS recalls_fts_delete AFTER DELETE ON recalls BEGIN
  INSERT INTO recalls_fts(recalls_fts, rowid, title, reason, recalling_firm, product_description)
  VALUES ('delete', old.rowid, old.title, old.reason, old.recalling_firm, old.product_description);
END;

-- Indices for common query patterns
CREATE INDEX IF NOT EXISTS idx_recalls_source        ON recalls(source);
CREATE INDEX IF NOT EXISTS idx_recalls_status        ON recalls(status);
CREATE INDEX IF NOT EXISTS idx_recalls_classification ON recalls(classification);
CREATE INDEX IF NOT EXISTS idx_recalls_init_date     ON recalls(recall_initiation_date DESC);
CREATE INDEX IF NOT EXISTS idx_recalls_content_hash  ON recalls(content_hash);
CREATE INDEX IF NOT EXISTS idx_recalls_firm          ON recalls(recalling_firm);

-- ─── Sync jobs ────────────────────────────────────────────────────────────────
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
  snapshot_files   TEXT NOT NULL DEFAULT '[]'  -- JSON array of file paths
);

CREATE INDEX IF NOT EXISTS idx_jobs_status     ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_source     ON sync_jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_started    ON sync_jobs(started_at DESC);

-- ─── Diff log ─────────────────────────────────────────────────────────────────
-- Every change to a recall record is logged here for auditability
CREATE TABLE IF NOT EXISTS diff_log (
  id           TEXT PRIMARY KEY,
  job_id       TEXT NOT NULL REFERENCES sync_jobs(id),
  source       TEXT NOT NULL,
  source_id    TEXT NOT NULL,
  action       TEXT NOT NULL CHECK(action IN ('added','updated','removed')),
  old_hash     TEXT,
  new_hash     TEXT,
  changed_at   TEXT NOT NULL DEFAULT (datetime('now')),
  summary      TEXT   -- human-readable description of what changed
);

CREATE INDEX IF NOT EXISTS idx_diff_job       ON diff_log(job_id);
CREATE INDEX IF NOT EXISTS idx_diff_source_id ON diff_log(source, source_id);
CREATE INDEX IF NOT EXISTS idx_diff_action    ON diff_log(action);
CREATE INDEX IF NOT EXISTS idx_diff_changed   ON diff_log(changed_at DESC);

-- ─── Snapshots index ──────────────────────────────────────────────────────────
-- Tracks every raw file downloaded for reproducibility
CREATE TABLE IF NOT EXISTS snapshots (
  id            TEXT PRIMARY KEY,
  job_id        TEXT REFERENCES sync_jobs(id),
  source        TEXT NOT NULL,
  file_path     TEXT NOT NULL UNIQUE,
  record_count  INTEGER NOT NULL DEFAULT 0,
  fetched_at    TEXT NOT NULL DEFAULT (datetime('now')),
  file_size     INTEGER NOT NULL DEFAULT 0,
  content_hash  TEXT NOT NULL  -- hash of full file for deduplication
);

CREATE INDEX IF NOT EXISTS idx_snapshots_source  ON snapshots(source);
CREATE INDEX IF NOT EXISTS idx_snapshots_fetched ON snapshots(fetched_at DESC);

-- ─── Users & auth (expandable) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin','debug')),
  usage_limit   INTEGER NOT NULL DEFAULT 10000,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS api_usage (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id),
  period_start  TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, period_start)
);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON api_usage(user_id, period_start);
