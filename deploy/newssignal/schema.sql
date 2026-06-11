PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS alerts (
  id           TEXT PRIMARY KEY,
  source       TEXT NOT NULL CHECK(source IN ('noaa_alerts','gdacs')),
  source_id    TEXT NOT NULL,
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  alert_type   TEXT,
  severity     TEXT,
  region       TEXT,
  effective_at TEXT,
  expires_at   TEXT,
  source_url   TEXT,
  raw_json     TEXT NOT NULL DEFAULT '{}',
  content_hash TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source, source_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS alerts_fts USING fts5(title, summary, alert_type, region, content='alerts', content_rowid='rowid');
CREATE TRIGGER IF NOT EXISTS alerts_fts_insert AFTER INSERT ON alerts BEGIN
  INSERT INTO alerts_fts(rowid, title, summary, alert_type, region) VALUES (new.rowid, new.title, new.summary, new.alert_type, new.region);
END;
CREATE TRIGGER IF NOT EXISTS alerts_fts_update AFTER UPDATE ON alerts BEGIN
  INSERT INTO alerts_fts(alerts_fts, rowid, title, summary, alert_type, region) VALUES ('delete', old.rowid, old.title, old.summary, old.alert_type, old.region);
  INSERT INTO alerts_fts(rowid, title, summary, alert_type, region) VALUES (new.rowid, new.title, new.summary, new.alert_type, new.region);
END;
CREATE TRIGGER IF NOT EXISTS alerts_fts_delete AFTER DELETE ON alerts BEGIN
  INSERT INTO alerts_fts(alerts_fts, rowid, title, summary, alert_type, region) VALUES ('delete', old.rowid, old.title, old.summary, old.alert_type, old.region);
END;

CREATE INDEX IF NOT EXISTS idx_alerts_source ON alerts(source);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_effective ON alerts(effective_at DESC);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id TEXT PRIMARY KEY, source TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  started_at TEXT NOT NULL DEFAULT (datetime('now')), finished_at TEXT,
  records_added INTEGER NOT NULL DEFAULT 0, records_updated INTEGER NOT NULL DEFAULT 0, records_removed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT, snapshot_files TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_started ON sync_jobs(started_at DESC);

CREATE TABLE IF NOT EXISTS diff_log (
  id TEXT PRIMARY KEY, job_id TEXT NOT NULL, source TEXT NOT NULL, source_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('added','updated','removed')), old_hash TEXT, new_hash TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now')), summary TEXT
);
CREATE INDEX IF NOT EXISTS idx_diff_job ON diff_log(job_id);
CREATE INDEX IF NOT EXISTS idx_diff_source_id ON diff_log(source, source_id);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin','debug')), usage_limit INTEGER NOT NULL DEFAULT 10000,
  password_hash TEXT, stripe_customer_id TEXT, stripe_subscription_id TEXT, billing_status TEXT NOT NULL DEFAULT 'none',
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS email_campaigns (
  id TEXT PRIMARY KEY, subject TEXT NOT NULL, body TEXT NOT NULL, sent_by_user_id TEXT NOT NULL REFERENCES users(id),
  recipient_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS api_usage (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), period_start TEXT NOT NULL, request_count INTEGER NOT NULL DEFAULT 0, UNIQUE(user_id, period_start));
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON api_usage(user_id, period_start);
