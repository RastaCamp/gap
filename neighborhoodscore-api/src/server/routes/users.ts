import { listUsers, getAdminAnalytics } from "../db/client";
import { isAdmin } from "./auth";
function json(d: unknown, status = 200): Response { return new Response(JSON.stringify(d), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }); }
export function handleAdminUsers(req: Request): Response { if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401); return json({ data: listUsers() }); }
export function handleAdminAnalytics(req: Request): Response { if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401); return json(getAdminAnalytics()); }
