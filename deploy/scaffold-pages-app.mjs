#!/usr/bin/env node
/**
 * Scaffold gap/deploy/<app>/ from gridstatus template + per-app API schema.
 * Usage: node scaffold-pages-app.mjs biosurge [watersafe ...]
 */
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const deployRoot = dirname(fileURLToPath(import.meta.url));
const gapRoot = join(deployRoot, "..");
const templateDir = join(deployRoot, "gridstatus");

const APPS = {
  foodsafe: {
    apiDir: "foodsafe-api",
    table: "recalls",
    ftsTable: "recalls_fts",
    apiPath: "recalls",
    totalKey: "total_recalls",
    orderBy: "reported_at DESC, created_at DESC",
    filters: [{ param: "recall_type", column: "recall_type" }],
    productName: "FoodSafe API",
    description: "Food recall and safety intelligence",
  },
  biosurge: {
    apiDir: "biosurge-api",
    table: "reports",
    ftsTable: "reports_fts",
    apiPath: "reports",
    totalKey: "total_reports",
    orderBy: "reported_at DESC, created_at DESC",
    filters: [{ param: "report_type", column: "report_type" }],
    productName: "BioSurge API",
    description: "Disease outbreak and biosurveillance intelligence",
  },
  watersafe: {
    apiDir: "watersafe-api",
    table: "reports",
    ftsTable: "reports_fts",
    apiPath: "reports",
    totalKey: "total_reports",
    orderBy: "reported_at DESC, created_at DESC",
    filters: [{ param: "state", column: "state" }],
    productName: "WaterSafe API",
    description: "Water quality, compliance, and drought monitoring",
  },
  groundtruth: {
    apiDir: "groundtruth-seismic-api",
    table: "events",
    ftsTable: "events_fts",
    apiPath: "events",
    totalKey: "total_events",
    orderBy: "occurred_at DESC, created_at DESC",
    filters: [{ param: "event_type", column: "event_type" }],
    productName: "GroundTruth API",
    description: "Seismic, volcanic, and geophysical event intelligence",
  },
  neighborhoodscore: {
    apiDir: "neighborhoodscore-api",
    table: "reports",
    ftsTable: "reports_fts",
    apiPath: "reports",
    totalKey: "total_reports",
    orderBy: "reported_at DESC, created_at DESC",
    filters: [
      { param: "report_type", column: "report_type" },
      { param: "state", column: "state" },
    ],
    productName: "NeighborhoodScore API",
    description: "Neighborhood safety, air quality, and health scores",
  },
  newssignal: {
    apiDir: "newssignal-api",
    table: "alerts",
    ftsTable: "alerts_fts",
    apiPath: "alerts",
    totalKey: "total_alerts",
    orderBy: "effective_at DESC, created_at DESC",
    filters: [{ param: "alert_type", column: "alert_type" }],
    productName: "NewsSignal API",
    description: "Emergency alerts and breaking news signals",
  },
  skywatch: {
    apiDir: "skywatch-api",
    table: "observations",
    ftsTable: "observations_fts",
    apiPath: "observations",
    totalKey: "total_observations",
    orderBy: "observed_at DESC, created_at DESC",
    filters: [{ param: "observation_type", column: "observation_type" }],
    productName: "SkyWatch API",
    description: "Space weather and satellite observation data",
  },
};

function sharedWorkerFiles() {
  for (const f of ["crypto.ts", "env.ts", "http.ts"]) {
    cpSync(join(templateDir, "worker", f), join("worker", f));
  }
  mkdirSync("functions/api", { recursive: true });
  cpSync(join(templateDir, "functions/api/[[path]].ts"), "functions/api/[[path]].ts");
}

function genDb(cfg) {
  const filterParams = cfg.filters.map((f) => `${f.param}?: string`).join("; ");
  const filterBlocks = cfg.filters
    .map(
      (f) => `  if (params.${f.param}) {
    conditions.push("${cfg.table}.${f.column} = ?");
    args.push(params.${f.param});
  }`
    )
    .join("\n");

  const queryParamsType = `{ q?: string; source?: string; ${filterParams}; page?: number; per_page?: number }`;

  return `import type { WorkerEnv } from "./env";
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
  const email = (env.DEFAULT_ADMIN_EMAIL ?? "rastacampllc@gmail.com").trim().toLowerCase();
  const ph = await hashPassword(password);
  let user = await getUserByEmail(env, email);
  if (!user) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      \`INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
       VALUES (?, ?, ?, ?, 'admin', 10000, ?, 'none')\`
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
    \`INSERT INTO users (id, email, name, region, role, usage_limit, password_hash, billing_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'none')\`
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
    \`UPDATE users SET
      stripe_customer_id = COALESCE(?, stripe_customer_id),
      stripe_subscription_id = COALESCE(?, stripe_subscription_id),
      billing_status = COALESCE(?, billing_status),
      updated_at = datetime('now')
     WHERE id = ?\`
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
  params: ${queryParamsType}
): Promise<{ rows: DataRow[]; total: number; source_counts: Record<string, number> }> {
  const page = params.page ?? 1;
  const per_page = Math.min(params.per_page ?? 50, 200);
  const offset = (page - 1) * per_page;

  const conditions: string[] = [];
  const args: (string | number)[] = [];

  if (params.q) {
    conditions.push(\`${cfg.table}.rowid IN (SELECT rowid FROM ${cfg.ftsTable} WHERE ${cfg.ftsTable} MATCH ?)\`);
    args.push(params.q.replace(/['"]/g, "") + "*");
  }
  if (params.source) {
    conditions.push("${cfg.table}.source = ?");
    args.push(params.source);
  }
${filterBlocks}

  const where = conditions.length ? \`WHERE \${conditions.join(" AND ")}\` : "";

  const totalRow = await env.DB.prepare(\`SELECT COUNT(*) as count FROM ${cfg.table} \${where}\`)
    .bind(...args)
    .first<{ count: number }>();
  const total = totalRow?.count ?? 0;

  const rows = await env.DB.prepare(
    \`SELECT * FROM ${cfg.table} \${where} ORDER BY ${cfg.orderBy} LIMIT ? OFFSET ?\`
  )
    .bind(...args, per_page, offset)
    .all<DataRow>();

  const sourceCounts = await env.DB.prepare(
    \`SELECT source, COUNT(*) as count FROM ${cfg.table} \${where} GROUP BY source\`
  )
    .bind(...args)
    .all<{ source: string; count: number }>();

  const source_counts = Object.fromEntries((sourceCounts.results ?? []).map((r) => [r.source, r.count]));
  return { rows: rows.results ?? [], total, source_counts };
}

export async function getStats(env: WorkerEnv) {
  const total =
    (await env.DB.prepare("SELECT COUNT(*) as count FROM ${cfg.table}").first<{ count: number }>())?.count ?? 0;
  const bySource = await env.DB.prepare("SELECT source, COUNT(*) as count FROM ${cfg.table} GROUP BY source").all<{
    source: string;
    count: number;
  }>();
  const lastJob = await env.DB.prepare(
    "SELECT * FROM sync_jobs WHERE status = 'success' ORDER BY finished_at DESC LIMIT 1"
  ).first();
  return {
    ${cfg.totalKey}: total,
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
`;
}

function genRouter(cfg) {
  const filterQueryReads = cfg.filters
    .map((f) => `      ${f.param}: p.get("${f.param}") ?? undefined,`)
    .join("\n");

  let router = readFileSync(join(templateDir, "worker/router.ts"), "utf8");
  router = router
    .replace(/queryReadings/g, "queryData")
    .replace(/from "\.\/db"[\s\S]*?type UserRow,/m, 'from "./db"')
    .replace(
      /if \(method === "GET" && path === "\/api\/readings"\) \{[\s\S]*?return json\(\{[\s\S]*?\}\);\s*\}/m,
      `if (method === "GET" && path === "/api/${cfg.apiPath}") {
    const gate = await gatePaidDataApi(env, req);
    if (gate) return gate;
    const p = url.searchParams;
    const page = parseInt(p.get("page") ?? "1");
    const per_page = parseInt(p.get("per_page") ?? "50");
    const result = await queryData(env, {
      q: p.get("q") ?? undefined,
      source: p.get("source") ?? undefined,
${filterQueryReads}
      page: isNaN(page) || page < 1 ? 1 : page,
      per_page: isNaN(per_page) ? 50 : per_page,
    });
    return json({
      data: result.rows,
      meta: {
        total: result.total,
        page: isNaN(page) || page < 1 ? 1 : page,
        per_page: isNaN(per_page) ? 50 : per_page,
        source_counts: result.source_counts,
      },
    });
  }`
    )
    .replace(/GridStatus API/g, cfg.productName)
    .replace(/Grid demand, outages, geomagnetic risk — EIA, NOAA SWPC/g, cfg.description)
    .replace(/"GET \/api\/readings": "Query readings"/g, `"GET /api/${cfg.apiPath}": "Query ${cfg.apiPath}"`)
    .replace(/MyAir API/g, cfg.productName);
  return router;
}

function genBuild(appName, apiDir) {
  return `import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gapRoot = join(root, "..", "..");
const frontendDir = join(gapRoot, "${apiDir}", "frontend");
const frontendDist = join(frontendDir, "dist");
const outDir = join(root, "dist");

console.log("[build] Installing & building ${appName} frontend…");
if (!existsSync(join(frontendDir, "node_modules"))) {
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
}
execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

if (!existsSync(frontendDist)) {
  throw new Error(\`Frontend dist not found at \${frontendDist}\`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(frontendDist, outDir, { recursive: true });

writeFileSync(
  join(outDir, "_redirects"),
  \`/api/*  /api/:splat  200\\n/*  /index.html  200\\n\`,
  "utf8"
);

console.log("[build] Output ready at", outDir);
`;
}

function genPackage(appName) {
  const dbName = `${appName}-db`;
  return JSON.stringify(
    {
      name: `${appName}-pages`,
      private: true,
      type: "module",
      scripts: {
        build: "node scripts/build.mjs",
        "db:migrate": `wrangler d1 execute ${dbName} --remote --file=./schema.sql`,
        "db:migrate:local": `wrangler d1 execute ${dbName} --local --file=./schema.sql`,
        deploy: `npm run build && wrangler pages deploy dist --project-name=${appName} --branch=main`,
        preview: "npm run build && wrangler pages dev dist",
      },
      dependencies: { bcryptjs: "^3.0.2", stripe: "^17.4.0" },
      devDependencies: {
        "@cloudflare/workers-types": "^4.20250408.0",
        typescript: "^5.8.3",
        wrangler: "^4.67.0",
      },
    },
    null,
    2
  );
}

function genWrangler(appName, cfg, dbId = "REPLACE_AFTER_D1_CREATE") {
  return `name = "${appName}"
compatibility_date = "2026-05-19"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "${appName}-db"
database_id = "${dbId}"

[vars]
MONTHLY_PRICE_USD = "20"
REQUIRE_PAID_API = "true"
ALLOW_PUBLIC_REGISTER = "true"
STRIPE_PRODUCT_NAME = "${cfg.productName}"
`;
}

function genWorkflow(appName, apiDir) {
  return `name: Deploy ${appName} to Cloudflare Pages

on:
  push:
    branches: [main]
    paths:
      - "deploy/${appName}/**"
      - "${apiDir}/frontend/**"
      - "common/**"
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Install & build
        working-directory: deploy/${appName}
        run: |
          npm ci || npm install
          npm install --prefix ../../${apiDir}/frontend
          npm run build

      - name: Apply D1 schema (remote)
        working-directory: deploy/${appName}
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        run: |
          npx wrangler d1 execute ${appName}-db --remote --file=./schema.sql || true

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=${appName}
`;
}

function scaffold(appName) {
  const cfg = APPS[appName];
  if (!cfg) throw new Error(`Unknown app: ${appName}`);

  const outDir = join(deployRoot, appName);
  if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, "worker"), { recursive: true });
  mkdirSync(join(outDir, "scripts"), { recursive: true });

  process.chdir(outDir);
  sharedWorkerFiles();

  writeFileSync("worker/db.ts", genDb(cfg));
  writeFileSync("worker/router.ts", genRouter(cfg));
  writeFileSync("scripts/build.mjs", genBuild(appName, cfg.apiDir));
  writeFileSync("package.json", genPackage(appName));
  writeFileSync("wrangler.toml", genWrangler(appName, cfg));

  const schemaSrc = join(gapRoot, cfg.apiDir, "src/server/db/schema.sql");
  let schema = readFileSync(schemaSrc, "utf8");
  schema = schema
    .replace(/PRAGMA journal_mode = WAL;\s*/g, "")
    .replace(/PRAGMA synchronous = NORMAL;\s*/g, "");
  writeFileSync("schema.sql", schema);

  const workflowPath = join(gapRoot, ".github/workflows", `deploy-${appName}-pages.yml`);
  writeFileSync(workflowPath, genWorkflow(appName, cfg.apiDir));

  console.log(`[scaffold] ${appName} → ${outDir}`);
}

const names = process.argv.slice(2);
const targets = names.length ? names : Object.keys(APPS);
for (const name of targets) scaffold(name);
