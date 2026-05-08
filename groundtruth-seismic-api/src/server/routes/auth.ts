import {
  getUserById,
  getUserByEmail,
  createUser,
  getUsageForUser,
  recordUsage,
  createSession,
  resolveSessionUserId,
  deleteSessionByToken,
  updateUserPassword,
} from "../db/client";
import { verifyPassword, hashPassword, canAccessPaidDataApi, monthlyPriceUsd, isPaidApiRequired } from "gap-common";

const DEBUG_TOKEN = "debug-token";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "dev-token-change-me";

function json(d: unknown, status = 200): Response {
  return new Response(JSON.stringify(d), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

/** Block unauthenticated or non-subscribed users from paid data APIs (when REQUIRE_PAID_API is not false). */
export function gatePaidDataApi(req: Request): Response | null {
  if (!isPaidApiRequired()) return null;
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return json({ error: "Sign in required", code: "login_required", monthly_price_usd: monthlyPriceUsd() }, 401);
  }
  if (token === DEBUG_TOKEN || token === ADMIN_TOKEN) return null;
  const userId = resolveSessionUserId(token);
  if (userId === "debug") return null;
  if (!userId) {
    return json({ error: "Sign in required", code: "login_required", monthly_price_usd: monthlyPriceUsd() }, 401);
  }
  const user = getUserById(userId);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (canAccessPaidDataApi(user)) return null;
  return json(
    {
      error: "Active subscription required",
      code: "subscription_required",
      monthly_price_usd: monthlyPriceUsd(),
    },
    402
  );
}

function publicUser(u: NonNullable<ReturnType<typeof getUserById>>) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    region: u.region,
    role: u.role,
    usage_limit: u.usage_limit,
    billing_status: u.billing_status,
  };
}

function sessionExpiryIso(remember: boolean): string {
  const days = remember ? 90 : 14;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export async function handleRegister(req: Request): Promise<Response> {
  if (process.env.ALLOW_PUBLIC_REGISTER === "false") {
    return json({ error: "Registration is disabled" }, 403);
  }
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const name = (body.name ?? "").trim() || email.split("@")[0];
  if (!email || !password) return json({ error: "email and password required" }, 400);
  if (password.length < 8) return json({ error: "password must be at least 8 characters" }, 400);
  if (getUserByEmail(email)) return json({ error: "email already registered" }, 409);
  const password_hash = await hashPassword(password);
  const user = createUser({ email, name, region: "", role: "user", password_hash });
  const token = createSession(user.id, sessionExpiryIso(true));
  return json({ token, user: publicUser(user) });
}

export async function handleLogin(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const remember = body.remember !== false;
  if (!email || !password) return json({ error: "email and password required" }, 400);

  const user = getUserByEmail(email);
  if (!user?.password_hash) return json({ error: "Invalid email or password" }, 401);
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return json({ error: "Invalid email or password" }, 401);

  const token = createSession(user.id, sessionExpiryIso(remember));
  return json({ token, user: publicUser(user) });
}

export function handleLogout(req: Request): Response {
  const auth = req.headers.get("Authorization") ?? "";
  const raw = auth.replace(/^Bearer\s+/i, "").trim();
  if (raw && raw !== DEBUG_TOKEN) deleteSessionByToken(raw);
  return json({ ok: true });
}

export function handleMe(req: Request): Response {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token === DEBUG_TOKEN) {
    const debugUser = {
      id: "debug",
      email: "debug@local",
      name: "Debug User",
      region: "—",
      role: "debug",
      usage_limit: 999999,
      billing_status: "none",
    };
    return json({ user: debugUser, usage: [] });
  }
  const userId = resolveSessionUserId(token);
  if (!userId) return json({ error: "Unauthorized" }, 401);
  const user = getUserById(userId);
  if (!user) return json({ error: "User not found" }, 404);
  const usage = getUsageForUser(userId);
  const period = new Date().toISOString().slice(0, 10);
  recordUsage(userId, period);
  return json({ user: publicUser(user), usage });
}

export function handleDebugLogin(_req: Request): Response {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEBUG_LOGIN === "false") {
    return json({ error: "Debug login disabled" }, 403);
  }
  return json({
    token: DEBUG_TOKEN,
    user: {
      id: "debug",
      email: "debug@local",
      name: "Debug User",
      region: "—",
      role: "debug",
      usage_limit: 999999,
      billing_status: "none",
    },
  });
}

export function getUserIdFromToken(req: Request): string | null {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token === DEBUG_TOKEN) return "debug";
  return resolveSessionUserId(token);
}

export function isAdmin(req: Request): boolean {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token === DEBUG_TOKEN) return true;
  if (token === ADMIN_TOKEN) return true;
  const userId = resolveSessionUserId(token);
  if (!userId) return false;
  const user = getUserById(userId);
  return user?.role === "admin" || user?.role === "debug";
}

export async function handleChangePassword(req: Request): Promise<Response> {
  const userId = getUserIdFromToken(req);
  if (!userId || userId === "debug") return json({ error: "Unauthorized" }, 401);
  const body = (await req.json().catch(() => ({}))) as { current?: string; next?: string };
  const next = body.next ?? "";
  if (next.length < 8) return json({ error: "password must be at least 8 characters" }, 400);
  const user = getUserById(userId);
  if (!user) return json({ error: "Not found" }, 404);
  if (user.password_hash) {
    const cur = body.current ?? "";
    const ok = await verifyPassword(cur, user.password_hash);
    if (!ok) return json({ error: "current password incorrect" }, 401);
  }
  updateUserPassword(userId, await hashPassword(next));
  return json({ ok: true });
}
