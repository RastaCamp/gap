export type WorkerEnv = {
  DB: D1Database;
  MONTHLY_PRICE_USD?: string;
  REQUIRE_PAID_API?: string;
  ALLOW_PUBLIC_REGISTER?: string;
  ADMIN_TOKEN?: string;
  DEFAULT_ADMIN_EMAIL?: string;
  DEFAULT_ADMIN_PASSWORD?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_ID?: string;
  STRIPE_PRODUCT_NAME?: string;
  STRIPE_PRODUCT_DESCRIPTION?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
};

export function monthlyPriceUsd(env: WorkerEnv): number {
  const raw = env.MONTHLY_PRICE_USD ?? "20";
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 20;
}

export function monthlyPriceCents(env: WorkerEnv): number {
  return Math.round(monthlyPriceUsd(env) * 100);
}

export function isPaidApiRequired(env: WorkerEnv): boolean {
  return env.REQUIRE_PAID_API !== "false";
}

export function canAccessPaidDataApi(user: { role: string; billing_status: string | null } | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "debug") return true;
  const s = (user.billing_status ?? "none").toLowerCase();
  return s === "active" || s === "trialing";
}
