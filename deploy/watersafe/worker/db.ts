import type { WorkerEnv } from "./env";
import { hashPassword, hashSessionToken, newSessionToken } from "./crypto";

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

export type DataRow = Record<string, unknown>;

export async function seedDefaultAdminIfConfigured(env: WorkerEnv): Promise<void> {
  const password = env.DEFAULT_ADMIN_PASSWORD?.trim();
  if (!password) return;
  const email = (env.DEFAULT_ADMIN_EMAIL ?? "admin@local").trim().toLowerCase();
  const ph = await hashPassword(password);
  let user = await getUserByEmail(env, email);
  if (!user) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
       VALUES (?, ?, ?, ?, 'admin', 10000, ?, 'none')`
    )
      .bind(id, email, "Admin", "", ph)
      .run();
    return;
  }
  if (user.role !== "admin") {
    await env.DB.prepare("UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE id = ?").bind(user.id).run();
  }
  if (!user.password_hash) {
    await env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(ph, user.id)
      .run();
  }
}

export async function getUserById(env: WorkerEnv, id: string): Promise<UserRow | null> {
  return (await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>()) ?? null;
}

export async function getUserByEmail(env: WorkerEnv, email: string): Promise<UserRow | null> {
  return (
    (await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email.trim().toLowerCase()).first<UserRow>()) ??
    null
  );
}

export async function createUser(
  env: WorkerEnv,
  record: {
    email: string;
    name?: string;
    region?: string;
    role?: string;
    usage_limit?: number;
    password_hash?: string | null;
  }
): Promise<UserRow> {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'none')`
  )
    .bind(
      id,
      record.email.trim().toLowerCase(),
      record.name ?? "",
      record.region ?? "",
      record.role ?? "user",
      record.usage_limit ?? 10000,
      record.password_hash ?? null
    )
    .run();
  return (await getUserById(env, id))!;
}

export async function updateUserPassword(env: WorkerEnv, userId: string, passwordHash: string): Promise<void> {
  await env.DB.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(passwordHash, userId)
    .run();
}

export async function updateUserStripe(
  env: WorkerEnv,
  userId: string,
  patch: { stripe_customer_id?: string | null; stripe_subscription_id?: string | null; billing_status?: string }
): Promise<void> {
  await env.DB.prepare(
    `UPDATE users SET
      stripe_customer_id = COALESCE(?, stripe_customer_id),
      stripe_subscription_id = COALESCE(?, stripe_subscription_id),
      billing_status = COALESCE(?, billing_status),
      updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(patch.stripe_customer_id ?? null, patch.stripe_subscription_id ?? null, patch.billing_status ?? null, userId)
    .run();
}

export async function pruneExpiredSessions(env: WorkerEnv): Promise<void> {
  await env.DB.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')").run();
}

export async function createSession(env: WorkerEnv, userId: string, expiresAtIso: string): Promise<string> {
  await pruneExpiredSessions(env);
  const token = newSessionToken();
  const th = await hashSessionToken(token);
  await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), userId, th, expiresAtIso)
    .run();
  return token;
}

export async function resolveSessionUserId(env: WorkerEnv, token: string): Promise<string | null> {
  if (!token) return null;
  await pruneExpiredSessions(env);
  const th = await hashSessionToken(token);
  const row = await env.DB.prepare(
    "SELECT user_id FROM sessions WHERE token_hash = ? AND datetime(expires_at) > datetime('now')"
  )
    .bind(th)
    .first<{ user_id: string }>();
  return row?.user_id ?? null;
}

export async function deleteSessionByToken(env: WorkerEnv, token: string): Promise<void> {
  const th = await hashSessionToken(token);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(th).run();
}

export async function queryData(
  env: WorkerEnv,
  params: { q?: string; source?: string; state?: string; page?: number; per_page?: number }
): Promise<{ rows: DataRow[]; total: number; source_counts: Record<string, number> }> {
  const page = params.page ?? 1;
  const per_page = Math.min(params.per_page ?? 50, 200);
  const offset = (page - 1) * per_page;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (params.q) {
    conditions.push(`reports.rowid IN (SELECT rowid FROM reports_fts WHERE reports_fts MATCH ?)`);
    args.push(params.q.replace(/['"]/g, "") + "*");
  }
  if (params.source) {
    conditions.push("reports.source = ?");
    args.push(params.source);
  }
  if (params.state) {
    conditions.push("reports.state = ?");
    args.push(params.state);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = await env.DB.prepare(`SELECT COUNT(*) as count FROM reports ${where}`)
    .bind(...args)
    .first<{ count: number }>();
  const total = totalRow?.count ?? 0;

  const rows = await env.DB.prepare(
    `SELECT * FROM reports ${where} ORDER BY reported_at DESC, created_at DESC LIMIT ? OFFSET ?`
  )
    .bind(...args, per_page, offset)
    .all<DataRow>();

  const sourceCounts = await env.DB.prepare(
    `SELECT source, COUNT(*) as count FROM reports ${where} GROUP BY source`
  )
    .bind(...args)
    .all<{ source: string; count: number }>();

  const source_counts = Object.fromEntries((sourceCounts.results ?? []).map((r) => [r.source, r.count]));
  return { rows: rows.results ?? [], total, source_counts };
}

export async function getStats(env: WorkerEnv) {
  const total =
    (await env.DB.prepare("SELECT COUNT(*) as count FROM reports").first<{ count: number }>())?.count ?? 0;
  const bySource = await env.DB.prepare("SELECT source, COUNT(*) as count FROM reports GROUP BY source").all<{
    source: string;
    count: number;
  }>();
  const lastJob = await env.DB.prepare(
    "SELECT * FROM sync_jobs WHERE status = 'success' ORDER BY finished_at DESC LIMIT 1"
  ).first();
  return {
    total_reports: total,
    by_source: Object.fromEntries((bySource.results ?? []).map((r) => [r.source, r.count])),
    last_successful_sync: (lastJob as { finished_at?: string } | null)?.finished_at ?? null,
  };
}

export async function listUsers(env: WorkerEnv): Promise<UserRow[]> {
  const r = await env.DB.prepare("SELECT * FROM users ORDER BY created_at DESC").all<UserRow>();
  return r.results ?? [];
}

export async function getAdminAnalytics(env: WorkerEnv) {
  const totalUsers =
    (await env.DB.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>())?.count ?? 0;
  const period = new Date().toISOString().slice(0, 10);
  const totalRequests =
    (
      await env.DB.prepare("SELECT COALESCE(SUM(request_count), 0) as total FROM api_usage WHERE period_start = ?")
        .bind(period)
        .first<{ total: number }>()
    )?.total ?? 0;
  const byRole = await env.DB.prepare("SELECT role, COUNT(*) as count FROM users GROUP BY role").all<{
    role: string;
    count: number;
  }>();
  return {
    total_users: totalUsers,
    total_requests_today: totalRequests,
    by_role: Object.fromEntries((byRole.results ?? []).map((r) => [r.role, r.count])),
  };
}
