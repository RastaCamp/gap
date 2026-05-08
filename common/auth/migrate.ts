import type { Database } from "bun:sqlite";

function hasColumn(db: Database, table: string, column: string): boolean {
  const rows = db.query<{ name: string }, []>(`PRAGMA table_info(${table})`).all();
  return rows.some((r) => r.name === column);
}

/** Add auth/billing columns and supporting tables to an existing product database. */
export function applyAuthSchemaMigrations(db: Database): void {
  if (!hasColumn(db, "users", "password_hash")) {
    db.run("ALTER TABLE users ADD COLUMN password_hash TEXT");
  }
  if (!hasColumn(db, "users", "stripe_customer_id")) {
    db.run("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT");
  }
  if (!hasColumn(db, "users", "stripe_subscription_id")) {
    db.run("ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT");
  }
  if (!hasColumn(db, "users", "billing_status")) {
    db.run("ALTER TABLE users ADD COLUMN billing_status TEXT NOT NULL DEFAULT 'none'");
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)");
  db.run("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)");

  db.run(`
    CREATE TABLE IF NOT EXISTS email_campaigns (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      sent_by_user_id TEXT NOT NULL REFERENCES users(id),
      recipient_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
