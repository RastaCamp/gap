import { initDb } from "./db/client";
import { handleRecalls, handleStats } from "./routes/recalls";
import { handleSync, handleJobs, handleJobDetail, handleAdminStatus } from "./routes/admin";
import { handleLogin, handleMe, handleDebugLogin, isAdmin } from "./routes/auth";
import { handleAdminUsers, handleAdminAnalytics } from "./routes/users";
import { mkdirSync } from "fs";
import { join } from "path";

// ─── Boot ─────────────────────────────────────────────────────────────────────

// Ensure data directories exist
for (const dir of ["data", "data/snapshots", "data/logs"]) {
  mkdirSync(join(process.cwd(), dir), { recursive: true });
}

// Initialize SQLite schema
initDb();

const PORT = parseInt(process.env.PORT ?? "3001");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "dev-token-change-me";

// ─── Auth middleware ──────────────────────────────────────────────────────────

function isAdminAuthorized(req: Request): boolean {
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  return token === ADMIN_TOKEN;
}

// ─── Router ───────────────────────────────────────────────────────────────────

function notFound(): Response {
  return new Response(
    JSON.stringify({ error: "Not found" }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized. Provide Authorization: Bearer <token>" }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// ─── Server ───────────────────────────────────────────────────────────────────

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // ── Public API ────────────────────────────────────────────────────────────

    if (method === "GET" && path === "/api/recalls") {
      return handleRecalls(req);
    }

    if (method === "GET" && path === "/api/stats") {
      return handleStats(req);
    }

    if (method === "GET" && path === "/api/health") {
      return json({ status: "ok", timestamp: new Date().toISOString() });
    }

    if (method === "POST" && path === "/api/login") return handleLogin(req);
    if (method === "POST" && path === "/api/debug-login") return handleDebugLogin(req);
    if (method === "GET" && path === "/api/users/me") return handleMe(req);

    // ── Admin API (token or admin user) ────────────────────────────────────────

    if (path.startsWith("/api/admin")) {
      const adminOk = isAdminAuthorized(req) || isAdmin(req);
      if (!adminOk) return unauthorized();

      if (method === "POST" && path === "/api/admin/sync") return handleSync(req);
      if (method === "GET" && path === "/api/admin/jobs") return handleJobs(req);
      if (method === "GET" && path.startsWith("/api/admin/jobs/")) return handleJobDetail(req, path.replace("/api/admin/jobs/", ""));
      if (method === "GET" && path === "/api/admin/status") return handleAdminStatus(req);
      if (method === "GET" && path === "/api/admin/users") return handleAdminUsers(req);
      if (method === "GET" && path === "/api/admin/analytics") return handleAdminAnalytics(req);

      return notFound();
    }

    // ── Docs / root ────────────────────────────────────────────────────────

    if (path === "/" || path === "/api") {
      return json({
        name: "FoodSafe API",
        version: "0.1.0",
        description: "Unified food safety recall intelligence — FDA, USDA, CDC, FoodSafety.gov",
        endpoints: {
          "GET /api/recalls":           "Query recall records",
          "GET /api/stats":             "Database statistics",
          "GET /api/health":            "Health check",
          "POST /api/admin/sync":       "Trigger data sync (auth required)",
          "GET /api/admin/jobs":        "List recent sync jobs (auth required)",
          "GET /api/admin/jobs/:id":    "Get job detail + diff log (auth required)",
          "GET /api/admin/status":      "Admin status dashboard (auth required)",
        },
        query_params: {
          q:              "Full-text search",
          source:         "fda | usda | cdc | foodsafety",
          status:         "ongoing | completed | terminated | unknown",
          classification: "Class I | Class II | Class III",
          page:           "Page number (default: 1)",
          per_page:       "Results per page (default: 50, max: 200)",
        },
      });
    }

    return notFound();
  },

  error(err) {
    console.error("[server] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  },
});

console.log(`
╔══════════════════════════════════════╗
║   FoodSafe API                       ║
║   http://localhost:${PORT}              ║
║                                      ║
║   GET  /api/recalls                  ║
║   GET  /api/stats                    ║
║   POST /api/admin/sync (auth)        ║
╚══════════════════════════════════════╝
`);
