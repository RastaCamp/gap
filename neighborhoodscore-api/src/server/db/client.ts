import { Database } from "bun:sqlite";
import { readFileSync } from "fs";
import { join } from "path";
import { applyAuthSchemaMigrations, hashPassword, hashSessionToken, newSessionToken } from "gap-common";
import type { Report, SyncJob, NormalizedRecord } from "../../shared/types";

const DB_PATH = process.env.DB_PATH ?? join(process.cwd(), "data", "neighborhoodscore.db");
let _db: Database | null = null;

export function getDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH, { create: true });
    _db.run("PRAGMA journal_mode = WAL");
    _db.run("PRAGMA foreign_keys = ON");
    _db.run("PRAGMA synchronous = NORMAL");
  }
  return _db;
}

export async function initDb(): Promise<void> {
  const db = getDb();
  db.exec(readFileSync(join(import.meta.dir, "schema.sql"), "utf-8"));
  applyAuthSchemaMigrations(db);
  await seedDefaultAdminIfConfigured();
  console.log("[db] Schema applied ✓");
}

export function upsertReport(record: NormalizedRecord & { id: string }): "inserted" | "updated" | "unchanged" {
  const db = getDb();
  const existing = db.query<{ content_hash: string }, string>("SELECT content_hash FROM reports WHERE source = ? AND source_id = ?").get(record.source, record.source_id);
  if (!existing) {
    db.run(`
      INSERT INTO reports (id, source, source_id, title, summary, report_type, location_name, location_zip, state, value, reported_at, source_url, raw_json, content_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, record.id, record.source, record.source_id, record.title, record.summary, record.report_type ?? null, record.location_name ?? null, record.location_zip ?? null, record.state ?? null, record.value ?? null, record.reported_at ?? null, record.source_url ?? null, record.raw_json, record.content_hash);
    return "inserted";
  }
  if (existing.content_hash === record.content_hash) return "unchanged";
  db.run(`
    UPDATE reports SET title = ?, summary = ?, report_type = ?, location_name = ?, location_zip = ?, state = ?, value = ?, reported_at = ?, source_url = ?, raw_json = ?, content_hash = ?, updated_at = datetime('now')
    WHERE source = ? AND source_id = ?
  `, record.title, record.summary, record.report_type ?? null, record.location_name ?? null, record.location_zip ?? null, record.state ?? null, record.value ?? null, record.reported_at ?? null, record.source_url ?? null, record.raw_json, record.content_hash, record.source, record.source_id);
  return "updated";
}

export function queryReports(params: { q?: string; source?: string; report_type?: string; state?: string; page?: number; per_page?: number }): { rows: Report[]; total: number; source_counts: Record<string, number> } {
  const db = getDb();
  const page = params.page ?? 1;
  const per_page = Math.min(params.per_page ?? 50, 200);
  const offset = (page - 1) * per_page;
  const conditions: string[] = [];
  const args: (string | number)[] = [];
  if (params.q) { conditions.push("reports.rowid IN (SELECT rowid FROM reports_fts WHERE reports_fts MATCH ?)"); args.push((params.q.replace(/['"]/g, "")) + "*"); }
  if (params.source) { conditions.push("reports.source = ?"); args.push(params.source); }
  if (params.report_type) { conditions.push("reports.report_type = ?"); args.push(params.report_type); }
  if (params.state) { conditions.push("reports.state = ?"); args.push(params.state); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const total = db.query<{ count: number }, (string | number)[]>(`SELECT COUNT(*) as count FROM reports ${where}`).get(...args)?.count ?? 0;
  const rows = db.query<Report, (string | number)[]>(`SELECT * FROM reports ${where} ORDER BY reported_at DESC, created_at DESC LIMIT ? OFFSET ?`).all(...args, per_page, offset);
  const sourceCounts = db.query<{ source: string; count: number }, (string | number)[]>(`SELECT source, COUNT(*) as count FROM reports ${where} GROUP BY source`).all(...args);
  return { rows, total, source_counts: Object.fromEntries(sourceCounts.map(r => [r.source, r.count])) };
}

export function createSyncJob(source: string): SyncJob {
  const id = crypto.randomUUID();
  getDb().run("INSERT INTO sync_jobs (id, source, status, started_at) VALUES (?, ?, 'running', datetime('now'))", id, source);
  return getSyncJob(id)!;
}

export function updateSyncJob(id: string, updates: Partial<SyncJob>): void {
  getDb().run(`UPDATE sync_jobs SET status = COALESCE(?, status), finished_at = COALESCE(?, finished_at), records_added = COALESCE(?, records_added), records_updated = COALESCE(?, records_updated), records_removed = COALESCE(?, records_removed), error_message = COALESCE(?, error_message), snapshot_files = COALESCE(?, snapshot_files) WHERE id = ?`,
    updates.status ?? null, updates.finished_at ?? null, updates.records_added ?? null, updates.records_updated ?? null, updates.records_removed ?? null, updates.error_message ?? null, updates.snapshot_files ? JSON.stringify(updates.snapshot_files) : null, id);
}

export function getSyncJob(id: string): SyncJob | null {
  return getDb().query<SyncJob, string>("SELECT * FROM sync_jobs WHERE id = ?").get(id) ?? null;
}

export function getRecentJobs(limit = 20): SyncJob[] {
  return getDb().query<SyncJob, number>("SELECT * FROM sync_jobs ORDER BY started_at DESC LIMIT ?").all(limit);
}

export function insertDiffLog(entry: { job_id: string; source: string; source_id: string; action: "added" | "updated" | "removed"; old_hash?: string; new_hash?: string; summary?: string }): void {
  getDb().run("INSERT INTO diff_log (id, job_id, source, source_id, action, old_hash, new_hash, summary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    crypto.randomUUID(), entry.job_id, entry.source, entry.source_id, entry.action, entry.old_hash ?? null, entry.new_hash ?? null, entry.summary ?? null);
}

export function getDiffLog(jobId: string): unknown[] {
  return getDb().query("SELECT * FROM diff_log WHERE job_id = ? ORDER BY changed_at DESC").all(jobId);
}

export function getStats() {
  const db = getDb();
  const total = db.query<{ count: number }, []>("SELECT COUNT(*) as count FROM reports").get()?.count ?? 0;
  const bySource = db.query<{ source: string; count: number }, []>("SELECT source, COUNT(*) as count FROM reports GROUP BY source").all();
  const lastJob = db.query<SyncJob, []>("SELECT * FROM sync_jobs WHERE status = 'success' ORDER BY finished_at DESC LIMIT 1").get();
  return { total_reports: total, by_source: Object.fromEntries(bySource.map(r => [r.source, r.count])), last_successful_sync: lastJob?.finished_at ?? null };
}
// ─── Users & usage (expandable) ───────────────────────────────────────────────

export type UserRow = {
  id: string;
  email: string;
  name: string;
  region: string;
  role: string;
  usage_limit: number;
  password_hash: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_status: string;
  created_at: string;
  updated_at: string;
};

async function seedDefaultAdminIfConfigured(): Promise<void> {
  const password = process.env.DEFAULT_ADMIN_PASSWORD?.trim();
  if (!password) return;
  const email = (process.env.DEFAULT_ADMIN_EMAIL ?? "rastacampllc@gmail.com").trim().toLowerCase();
  const ph = await hashPassword(password);
  let user = getUserByEmail(email);
  if (!user) {
    const id = crypto.randomUUID();
    getDb().run(
      `INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
       VALUES (?, ?, ?, ?, 'admin', 10000, ?, 'none')`,
      id, email, "Admin", "", ph
    );
    user = getUserById(id)!;
    console.log("[db] Default admin created:", email);
    return;
  }
  if (user.role !== "admin") {
    getDb().run("UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?", user.id);
  }
  if (!user.password_hash) {
    getDb().run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", ph, user.id);
    console.log("[db] Default admin password set:", email);
  }
}

export function listUsers(): UserRow[] {
  return getDb().query<UserRow, []>("SELECT * FROM users ORDER BY created_at DESC").all();
}

export function getUserById(id: string): UserRow | null {
  return getDb().query<UserRow, string>("SELECT * FROM users WHERE id = ?").get(id) ?? null;
}

export function getUserByEmail(email: string): UserRow | null {
  return getDb().query<UserRow, string>("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) ?? null;
}

export function createUser(record: {
  email: string;
  name?: string;
  region?: string;
  role?: string;
  usage_limit?: number;
  password_hash?: string | null;
}): UserRow {
  const id = crypto.randomUUID();
  getDb().run(
    `INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'none')`,
    id,
    record.email.trim().toLowerCase(),
    record.name ?? "",
    record.region ?? "",
    record.role ?? "user",
    record.usage_limit ?? 10000,
    record.password_hash ?? null
  );
  return getUserById(id)!;
}

export function updateUserPassword(userId: string, passwordHash: string): void {
  getDb().run("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?", passwordHash, userId);
}

export function updateUserStripe(
  userId: string,
  patch: { stripe_customer_id?: string | null; stripe_subscription_id?: string | null; billing_status?: string }
): void {
  const row = getUserById(userId);
  if (!row) return;
  getDb().run(
    `UPDATE users SET
      stripe_customer_id = COALESCE(?, stripe_customer_id),
      stripe_subscription_id = COALESCE(?, stripe_subscription_id),
      billing_status = COALESCE(?, billing_status),
      updated_at = datetime('now')
     WHERE id = ?`,
    patch.stripe_customer_id ?? null,
    patch.stripe_subscription_id ?? null,
    patch.billing_status ?? null,
    userId
  );
}

export function pruneExpiredSessions(): void {
  getDb().run("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')");
}

export function createSession(userId: string, expiresAtIso: string): string {
  pruneExpiredSessions();
  const token = newSessionToken();
  const th = hashSessionToken(token);
  getDb().run(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
    crypto.randomUUID(),
    userId,
    th,
    expiresAtIso
  );
  return token;
}

export function resolveSessionUserId(token: string): string | null {
  if (!token) return null;
  pruneExpiredSessions();
  const th = hashSessionToken(token);
  const row = getDb().query<{ user_id: string }, string>(
    "SELECT user_id FROM sessions WHERE token_hash = ? AND datetime(expires_at) > datetime('now')"
  ).get(th);
  return row?.user_id ?? null;
}

export function deleteSessionByToken(token: string): void {
  const th = hashSessionToken(token);
  getDb().run("DELETE FROM sessions WHERE token_hash = ?", th);
}

export function recordEmailCampaign(subject: string, body: string, sentByUserId: string, recipientCount: number): void {
  getDb().run(
    "INSERT INTO email_campaigns (id, subject, body, sent_by_user_id, recipient_count) VALUES (?, ?, ?, ?, ?)",
    crypto.randomUUID(),
    subject,
    body,
    sentByUserId,
    recipientCount
  );
}

export function getUsageForUser(userId: string): { period_start: string; request_count: number }[] {
  return getDb().query<{ period_start: string; request_count: number }, string>(
    "SELECT period_start, request_count FROM api_usage WHERE user_id = ? ORDER BY period_start DESC LIMIT 12"
  ).all(userId);
}

export function recordUsage(userId: string, periodStart: string): void {
  const db = getDb();
  const id = crypto.randomUUID();
  db.run(
    "INSERT INTO api_usage (id, user_id, period_start, request_count) VALUES (?, ?, ?, 1) ON CONFLICT(user_id, period_start) DO UPDATE SET request_count = request_count + 1",
    id, userId, periodStart
  );
}

export function getAdminAnalytics(): { total_users: number; total_requests_today: number; by_role: Record<string, number> } {
  const db = getDb();
  const totalUsers = db.query<{ count: number }, []>("SELECT COUNT(*) as count FROM users").get()?.count ?? 0;
  const period = new Date().toISOString().slice(0, 10);
  const totalRequests = db.query<{ total: number }, string>(
    "SELECT COALESCE(SUM(request_count), 0) as total FROM api_usage WHERE period_start = ?"
  ).get(period)?.total ?? 0;
  const byRole = db.query<{ role: string; count: number }, []>("SELECT role, COUNT(*) as count FROM users GROUP BY role").all();
  return { total_users: totalUsers, total_requests_today: totalRequests, by_role: Object.fromEntries(byRole.map(r => [r.role, r.count])) };
}
