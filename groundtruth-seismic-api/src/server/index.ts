import { initDb } from "./db/client";
import { handleEvents, handleStats } from "./routes/events";
import { handleSync, handleJobs, handleJobDetail, handleAdminStatus } from "./routes/admin";
import { handleLogin, handleMe, handleDebugLogin, handleRegister, handleLogout, handleChangePassword, isAdmin, gatePaidDataApi } from "./routes/auth";
import { handleAdminUsers, handleAdminAnalytics, handleAdminCreateUser, handleAdminEmailBlast } from "./routes/users";
import { handleCreateCheckout, handleStripeWebhook, handlePublicPricing } from "./routes/billing";
import { mkdirSync } from "fs";
import { join } from "path";

for (const dir of ["data", "data/snapshots", "data/logs"]) mkdirSync(join(process.cwd(), dir), { recursive: true });
await initDb();

const PORT = parseInt(process.env.PORT ?? "3003");
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "dev-token-change-me";

function isAdminToken(req: Request): boolean {
  const auth = req.headers.get("Authorization");
  return auth ? auth.replace(/^Bearer\s+/i, "").trim() === ADMIN_TOKEN : false;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (method === "OPTIONS") return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });

    if (method === "GET" && path === "/api/pricing") return handlePublicPricing(req);
    if (method === "GET" && path === "/api/events") {
      const g = gatePaidDataApi(req);
      if (g) return g;
      return handleEvents(req);
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
      if (!isAdminToken(req) && !isAdmin(req)) return json({ error: "Unauthorized" }, 401);
      if (method === "POST" && path === "/api/admin/sync") return handleSync(req);
      if (method === "GET" && path === "/api/admin/jobs") return handleJobs(req);
      if (method === "GET" && path.startsWith("/api/admin/jobs/")) return handleJobDetail(req, path.replace("/api/admin/jobs/", ""));
      if (method === "GET" && path === "/api/admin/status") return handleAdminStatus(req);
      if (method === "GET" && path === "/api/admin/users") return handleAdminUsers(req);
      if (method === "POST" && path === "/api/admin/users") return handleAdminCreateUser(req);
      if (method === "GET" && path === "/api/admin/analytics") return handleAdminAnalytics(req);
      if (method === "POST" && path === "/api/admin/email-blast") return handleAdminEmailBlast(req);
      return json({ error: "Not found" }, 404);
    }

    if (path === "/" || path === "/api") return json({
      name: "GroundTruth Seismic API",
      version: "0.1.0",
      description: "Earthquakes, volcanic ash, seismic — USGS, IRIS, VAAC, RSOE",
      endpoints: { "GET /api/events": "Query events", "GET /api/stats": "Stats", "GET /api/health": "Health", "POST /api/admin/sync": "Sync (auth)", "GET /api/admin/jobs": "Jobs (auth)", "GET /api/admin/jobs/:id": "Job detail (auth)", "GET /api/admin/status": "Status (auth)" },
      query_params: { q: "Search", source: "usgs_earthquake | iris | vaac | rsoe", event_type: "Filter", page: "Page", per_page: "Per page" },
    });

    return json({ error: "Not found" }, 404);
  },
  error(err) {
    console.error("[server]", err);
    return json({ error: "Internal server error" }, 500);
  },
});

console.log(`GroundTruth Seismic API http://localhost:${PORT}  GET /api/events  POST /api/admin/sync (auth)`);
