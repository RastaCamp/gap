/** Billing gate helpers — used by APIs and static pricing display. */

export type UserForBillingGate = { role: string; billing_status: string | null };

/** Default 20 — override with MONTHLY_PRICE_USD in .env (e.g. 29.99). */
export function monthlyPriceUsd(): number {
  const raw = process.env.MONTHLY_PRICE_USD ?? "20";
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : 20;
}

export function monthlyPriceCents(): number {
  return Math.round(monthlyPriceUsd() * 100);
}

/** When false, data APIs work without an active subscription (local dev). */
export function isPaidApiRequired(): boolean {
  return process.env.REQUIRE_PAID_API !== "false";
}

export function canAccessPaidDataApi(user: UserForBillingGate | null | undefined): boolean {
  if (!user) return false;
  if (user.role === "admin" || user.role === "debug") return true;
  const s = (user.billing_status ?? "none").toLowerCase();
  return s === "active" || s === "trialing";
}
