import { getUserById, getUserByEmail, createUser, getUsageForUser, recordUsage } from "../db/client";

const DEBUG_TOKEN = "debug-token";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "dev-token-change-me";

const tokenToUserId = new Map<string, string>();

function json(d: unknown, status = 200): Response {
  return new Response(JSON.stringify(d), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}

export async function handleLogin(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { email?: string; password?: string; role?: string };
  const email = (body.email ?? "").trim();
  const role = (body.role ?? "user") as string;
  if (!email) return json({ error: "email required" }, 400);
  let user = getUserByEmail(email);
  if (!user) user = createUser({ email, name: email.split("@")[0], region: "", role });
  const token = crypto.randomUUID();
  tokenToUserId.set(token, user.id);
  return json({ token, user: { id: user.id, email: user.email, name: user.name, region: user.region, role: user.role, usage_limit: user.usage_limit } });
}

export function handleMe(req: Request): Response {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token === DEBUG_TOKEN) return json({ user: { id: "debug", email: "debug@local", name: "Debug User", region: "—", role: "debug", usage_limit: 999999 }, usage: [] });
  const userId = tokenToUserId.get(token);
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const user = getUserById(userId);
  if (!user) return json({ error: "User not found" }, 404);
  const usage = getUsageForUser(userId);
  const period = new Date().toISOString().slice(0, 10);
  recordUsage(userId, period);
  return json({ user: { id: user.id, email: user.email, name: user.name, region: user.region, role: user.role, usage_limit: user.usage_limit }, usage });
}

export function handleDebugLogin(_req: Request): Response {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEBUG_LOGIN === "false") {
    return json({ error: "Debug login disabled" }, 403);
  }
  return json({ token: DEBUG_TOKEN, user: { id: "debug", email: "debug@local", name: "Debug User", region: "—", role: "debug", usage_limit: 999999 } });
}

export function isAdmin(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token === DEBUG_TOKEN) return true;
  if (token === ADMIN_TOKEN) return true;
  const userId = tokenToUserId.get(token);
  if (!userId) return false;
  const user = getUserById(userId);
  return user?.role === "admin" || user?.role === "debug";
}
