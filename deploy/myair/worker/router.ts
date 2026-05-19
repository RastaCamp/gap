import Stripe from "stripe";
import type { WorkerEnv } from "./env";
import {
  canAccessPaidDataApi,
  isPaidApiRequired,
  monthlyPriceCents,
  monthlyPriceUsd,
} from "./env";
import { hashPassword, verifyPassword } from "./crypto";
import { corsPreflight, json } from "./http";
import {
  createSession,
  createUser,
  deleteSessionByToken,
  getAdminAnalytics,
  getStats,
  getUserByEmail,
  getUserById,
  listUsers,
  queryReadings,
  resolveSessionUserId,
  seedDefaultAdminIfConfigured,
  updateUserPassword,
  updateUserStripe,
  type UserRow,
} from "./db";

const DEBUG_TOKEN = "debug-token";

let seeded = false;

async function ensureSeeded(env: WorkerEnv): Promise<void> {
  if (seeded) return;
  await seedDefaultAdminIfConfigured(env);
  seeded = true;
}

function bearerToken(req: Request): string {
  return (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

async function getUserIdFromToken(env: WorkerEnv, req: Request): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  if (token === DEBUG_TOKEN) return "debug";
  if (token === env.ADMIN_TOKEN) return null;
  return resolveSessionUserId(env, token);
}

function publicUser(u: UserRow) {
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

async function gatePaidDataApi(env: WorkerEnv, req: Request): Promise<Response | null> {
  if (!isPaidApiRequired(env)) return null;
  const token = bearerToken(req);
  if (!token) {
    return json(
      { error: "Sign in required", code: "login_required", monthly_price_usd: monthlyPriceUsd(env) },
      401
    );
  }
  if (token === DEBUG_TOKEN || token === env.ADMIN_TOKEN) return null;
  const userId = await resolveSessionUserId(env, token);
  if (userId === "debug") return null;
  if (!userId) {
    return json(
      { error: "Sign in required", code: "login_required", monthly_price_usd: monthlyPriceUsd(env) },
      401
    );
  }
  const user = await getUserById(env, userId);
  if (!user) return json({ error: "Unauthorized" }, 401);
  if (canAccessPaidDataApi(user)) return null;
  return json(
    {
      error: "Active subscription required",
      code: "subscription_required",
      monthly_price_usd: monthlyPriceUsd(env),
    },
    402
  );
}

function isAdminAuthorized(env: WorkerEnv, req: Request): boolean {
  const token = bearerToken(req);
  return !!token && token === env.ADMIN_TOKEN;
}

async function isAdminUser(env: WorkerEnv, req: Request): Promise<boolean> {
  const userId = await getUserIdFromToken(env, req);
  if (!userId || userId === "debug") return false;
  const user = await getUserById(env, userId);
  return user?.role === "admin";
}

export async function handleApiRequest(req: Request, env: WorkerEnv): Promise<Response> {
  await ensureSeeded(env);

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") return corsPreflight();

  if (method === "GET" && path === "/api/pricing") {
    return json({
      monthly_price_usd: monthlyPriceUsd(env),
      currency: "usd",
      interval: "month",
      require_paid_api: isPaidApiRequired(env),
    });
  }

  if (method === "GET" && path === "/api/health") {
    return json({ status: "ok", timestamp: new Date().toISOString(), platform: "cloudflare-pages" });
  }

  if (method === "GET" && path === "/api/readings") {
    const gate = await gatePaidDataApi(env, req);
    if (gate) return gate;
    const p = url.searchParams;
    const page = parseInt(p.get("page") ?? "1");
    const per_page = parseInt(p.get("per_page") ?? "50");
    const result = await queryReadings(env, {
      q: p.get("q") ?? undefined,
      source: p.get("source") ?? undefined,
      category: p.get("category") ?? undefined,
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
  }

  if (method === "GET" && path === "/api/stats") {
    const gate = await gatePaidDataApi(env, req);
    if (gate) return gate;
    return json(await getStats(env));
  }

  if (method === "POST" && path === "/api/login") {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      remember?: boolean;
    };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const user = await getUserByEmail(env, email);
    if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) {
      return json({ error: "Invalid email or password" }, 401);
    }
    const token = await createSession(env, user.id, sessionExpiryIso(!!body.remember));
    return json({ token, user: publicUser(user) });
  }

  if (method === "POST" && path === "/api/register") {
    if (env.ALLOW_PUBLIC_REGISTER === "false") return json({ error: "Registration is disabled" }, 403);
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      name?: string;
    };
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    if (!email || password.length < 8) return json({ error: "Email and password (8+ chars) required" }, 400);
    if (await getUserByEmail(env, email)) return json({ error: "Email already registered" }, 409);
    const ph = await hashPassword(password);
    const user = await createUser(env, { email, name: body.name, password_hash: ph });
    const token = await createSession(env, user.id, sessionExpiryIso(false));
    return json({ token, user: publicUser(user) }, 201);
  }

  if (method === "POST" && path === "/api/logout") {
    const token = bearerToken(req);
    if (token) await deleteSessionByToken(env, token);
    return json({ ok: true });
  }

  if (method === "POST" && path === "/api/debug-login") {
    return json({ token: DEBUG_TOKEN, user: { id: "debug", email: "debug@local", role: "debug", billing_status: "active" } });
  }

  if (method === "GET" && path === "/api/users/me") {
    const userId = await getUserIdFromToken(env, req);
    if (!userId) return json({ error: "Unauthorized" }, 401);
    if (userId === "debug") {
      return json({ id: "debug", email: "debug@local", role: "debug", billing_status: "active" });
    }
    const user = await getUserById(env, userId);
    if (!user) return json({ error: "Not found" }, 404);
    return json(publicUser(user));
  }

  if (method === "POST" && path === "/api/users/change-password") {
    const userId = await getUserIdFromToken(env, req);
    if (!userId || userId === "debug") return json({ error: "Unauthorized" }, 401);
    const body = (await req.json().catch(() => ({}))) as { current_password?: string; new_password?: string };
    const user = await getUserById(env, userId);
    if (!user) return json({ error: "Not found" }, 404);
    if (!user.password_hash || !(await verifyPassword(body.current_password ?? "", user.password_hash))) {
      return json({ error: "Current password incorrect" }, 401);
    }
    if ((body.new_password ?? "").length < 8) return json({ error: "New password must be 8+ characters" }, 400);
    await updateUserPassword(env, userId, await hashPassword(body.new_password!));
    return json({ ok: true });
  }

  if (method === "POST" && path === "/api/billing/checkout") {
    if (!env.STRIPE_SECRET_KEY) return json({ error: "Stripe is not configured" }, 503);
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const userId = await getUserIdFromToken(env, req);
    if (!userId || userId === "debug") return json({ error: "Unauthorized" }, 401);
    const user = await getUserById(env, userId);
    if (!user) return json({ error: "Not found" }, 404);

    const priceId = env.STRIPE_PRICE_ID?.trim();
    const cents = monthlyPriceCents(env);
    if (!priceId && cents < 50) return json({ error: "MONTHLY_PRICE_USD too low or invalid" }, 503);

    const origin = url.origin;
    const success = env.STRIPE_SUCCESS_URL ?? `${origin}/#/dashboard?billing=success`;
    const cancel = env.STRIPE_CANCEL_URL ?? `${origin}/#/pricing?billing=cancel`;

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
      customerId = c.id;
      await updateUserStripe(env, user.id, { stripe_customer_id: customerId, billing_status: "pending" });
    }

    const lineItems = priceId
      ? [{ price: priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: env.STRIPE_PRODUCT_NAME ?? "MyAir API",
                description: env.STRIPE_PRODUCT_DESCRIPTION ?? `Monthly access — $${monthlyPriceUsd(env).toFixed(2)}/mo`,
              },
              unit_amount: cents,
              recurring: { interval: "month" as const },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: lineItems,
      success_url: success,
      cancel_url: cancel,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
    });
    return json({ url: session.url });
  }

  if (method === "POST" && path === "/api/webhooks/stripe") {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      return json({ error: "Stripe webhook not configured" }, 503);
    }
    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const sig = req.headers.get("stripe-signature");
    if (!sig) return json({ error: "Missing signature" }, 400);
    const raw = await req.text();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return json({ error: "Invalid signature" }, 400);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (userId) await updateUserStripe(env, userId, { stripe_subscription_id: subId ?? null, billing_status: "active" });
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) {
        const status = sub.status === "active" || sub.status === "trialing" ? sub.status : "canceled";
        await updateUserStripe(env, userId, {
          stripe_subscription_id: sub.id,
          billing_status: event.type === "customer.subscription.deleted" ? "canceled" : status,
        });
      }
    }
    return json({ received: true });
  }

  if (path.startsWith("/api/admin")) {
    const admin = isAdminAuthorized(env, req) || (await isAdminUser(env, req));
    if (!admin) return json({ error: "Unauthorized. Use Authorization: Bearer <token>" }, 401);

    if (method === "GET" && path === "/api/admin/users") {
      const users = await listUsers(env);
      return json({
        users: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          billing_status: u.billing_status,
          created_at: u.created_at,
        })),
      });
    }
    if (method === "GET" && path === "/api/admin/analytics") {
      return json(await getAdminAnalytics(env));
    }
    if (method === "POST" && path === "/api/admin/sync") {
      return json(
        {
          error: "Sync runs on a scheduled Worker in production. Use local ingest for bulk imports.",
          hint: "wrangler dev + bun run ingest locally, or add a Cron Worker later.",
        },
        501
      );
    }
    return json({ error: "Not found" }, 404);
  }

  if (path === "/" || path === "/api") {
    return json({
      name: "MyAir API",
      version: "0.2.0-cloudflare",
      description: "Air quality, radiation, and local environment",
      endpoints: {
        "GET /api/readings": "Query readings",
        "GET /api/stats": "Database statistics",
        "GET /api/health": "Health check",
        "GET /api/pricing": "Public pricing",
      },
    });
  }

  return json({ error: "Not found" }, 404);
}
