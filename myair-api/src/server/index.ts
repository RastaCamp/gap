import { initDb } from "./db/client";
import { handleReadings, handleStats } from "./routes/readings";
import { handleSync, handleJobs, handleJobDetail, handleAdminStatus } from "./routes/admin";
import { handleLogin, handleMe, handleDebugLogin, handleRegister, handleLogout, handleChangePassword, isAdmin, gatePaidDataApi } from "./routes/auth";
import { handleAdminUsers, handleAdminAnalytics, handleAdminCreateUser, handleAdminEmailBlast } from "./routes/users";
import { handleCreateCheckout, handleStripeWebhook, handlePublicPricing } from "./routes/billing";
import { mkdirSync } from "fs";
import { join } from "path";

for (const dir of ["data", "data/snapshots", "data/logs"]) {
  mkdirSync(join(process.cwd(), dir), { recursive: true });
}

await initDb();

const PORT = parseInt(process.env.PORT ?? "3002");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "dev-token-change-me";

function isAdminAuthorized(req: Request): boolean {
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  return auth.replace(/^Bearer\s+/i, "").trim() === ADMIN_TOKEN;
}

function notFound(): Response {
  return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
}
function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized. Use Authorization: Bearer <token>" }), { status: 401, headers: { "Content-Type": "application/json" } });
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

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    if (method === "GET" && path === "/api/pricing") return handlePublicPricing(req);
    if (method === "GET" && path === "/api/readings") {
      const g = gatePaidDataApi(req);
      if (g) return g;
      return handleReadings(req);
    }
    if (method === "GET" && path === "/api/stats") {
      const g = gatePaidDataApi(req);
      if (g) return g;
      return handleStats(req);
    }
    if (method === "GET" && path === "/api/health") return json({ status: "ok", timestamp: new Date().toISOString() });

    if (method === "POST" && path === "/api/webhooks/stripe") return handleStripeWebhook(req);
    if (method === "POST" && path === "/api/login") return handleLogin(req);
    if (method === "POST" && path === "/api/register") return handleRegister(req);
    if (method === "POST" && path === "/api/logout") return handleLogout(req);
    if (method === "POST" && path === "/api/debug-login") return handleDebugLogin(req);
    if (method === "GET" && path === "/api/users/me") return handleMe(req);
    if (method === "POST" && path === "/api/users/change-password") return handleChangePassword(req);
    if (method === "POST" && path === "/api/billing/checkout") return handleCreateCheckout(req);

    if (path.startsWith("/api/admin")) {
      if (!isAdminAuthorized(req) && !isAdmin(req)) return unauthorized();
      if (method === "POST" && path === "/api/admin/sync") return handleSync(req);
      if (method === "GET" && path === "/api/admin/jobs") return handleJobs(req);
      if (method === "GET" && path.startsWith("/api/admin/jobs/")) return handleJobDetail(req, path.replace("/api/admin/jobs/", ""));
      if (method === "GET" && path === "/api/admin/status") return handleAdminStatus(req);
      if (method === "GET" && path === "/api/admin/users") return handleAdminUsers(req);
      if (method === "POST" && path === "/api/admin/users") return handleAdminCreateUser(req);
      if (method === "GET" && path === "/api/admin/analytics") return handleAdminAnalytics(req);
      if (method === "POST" && path === "/api/admin/email-blast") return handleAdminEmailBlast(req);
      return notFound();
    }

    if (path === "/" || path === "/api") {
      return json({
        name: "MyAir API",
        version: "0.1.0",
        description: "Air quality, radiation, and local environment — AirNow, RadNet, and more",
        endpoints: {
          "GET /api/readings": "Query readings",
          "GET /api/stats": "Database statistics",
          "GET /api/health": "Health check",
          "POST /api/admin/sync": "Trigger sync (auth)",
          "GET /api/admin/jobs": "List sync jobs (auth)",
          "GET /api/admin/jobs/:id": "Job detail + diff (auth)",
          "GET /api/admin/status": "Admin status (auth)",
        },
        query_params: { q: "Full-text search", source: "airnow | radnet | ...", category: "Filter", page: "Page", per_page: "Per page" },
      });
    }

    return notFound();
  },
  error(err) {
    console.error("[server]", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  },
});

console.log(`
╔══════════════════════════════════════╗
║   MyAir API                          ║
║   http://localhost:${PORT}              ║
║   GET  /api/readings                 ║
║   GET  /api/stats                    ║
║   POST /api/admin/sync (auth)        ║
╚══════════════════════════════════════╝
`);
