import {
  listUsers,
  getAdminAnalytics,
  createUser,
  getUserByEmail,
  recordEmailCampaign,
} from "../db/client";
import { isAdmin, getUserIdFromToken } from "./auth";
import { hashPassword } from "gap-common";

function json(d: unknown, status = 200): Response {
  return new Response(JSON.stringify(d), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

export function handleAdminUsers(req: Request): Response {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  const users = listUsers();
  return json({
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      region: u.region,
      role: u.role,
      usage_limit: u.usage_limit,
      billing_status: u.billing_status,
      stripe_customer_id: u.stripe_customer_id,
      stripe_subscription_id: u.stripe_subscription_id,
    })),
  });
}

export function handleAdminAnalytics(req: Request): Response {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  const analytics = getAdminAnalytics();
  return json(analytics);
}

export async function handleAdminCreateUser(req: Request): Promise<Response> {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    region?: string;
    usage_limit?: number;
  };
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const role = body.role === "admin" ? "admin" : "user";
  if (!email || !password) return json({ error: "email and password required" }, 400);
  if (password.length < 8) return json({ error: "password must be at least 8 characters" }, 400);
  if (getUserByEmail(email)) return json({ error: "email already exists" }, 409);
  const password_hash = await hashPassword(password);
  const user = createUser({
    email,
    name: body.name ?? email.split("@")[0],
    region: body.region ?? "",
    role,
    usage_limit: body.usage_limit ?? 10000,
    password_hash,
  });
  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      usage_limit: user.usage_limit,
    },
  });
}

/** Broadcast a simple email to all client accounts; uses Resend when RESEND_API_KEY is set. */
export async function handleAdminEmailBlast(req: Request): Promise<Response> {
  if (!isAdmin(req)) return json({ error: "Unauthorized" }, 401);
  const adminId = getUserIdFromToken(req);
  if (!adminId || adminId === "debug") return json({ error: "Unauthorized" }, 401);

  const body = (await req.json().catch(() => ({}))) as { subject?: string; html?: string };
  const subject = (body.subject ?? "").trim();
  const html = (body.html ?? "").trim();
  if (!subject || !html) return json({ error: "subject and html required" }, 400);

  const recipients = listUsers().filter((u) => u.role === "user" && u.email.includes("@"));
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (resendKey) {
    let sent = 0;
    for (const u of recipients) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "GAP <onboarding@resend.dev>",
          to: [u.email],
          subject,
          html,
        }),
      });
      if (r.ok) sent++;
    }
    recordEmailCampaign(subject, html, adminId, sent);
    return json({ ok: true, sent, total: recipients.length, mode: "resend" });
  }

  recordEmailCampaign(subject, html, adminId, recipients.length);
  return json({
    ok: true,
    logged: recipients.length,
    mode: "log_only",
    hint: "Set RESEND_API_KEY and RESEND_FROM to deliver email",
  });
}
