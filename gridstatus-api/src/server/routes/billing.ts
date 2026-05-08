import Stripe from "stripe";
import { getUserById, updateUserStripe, getDb } from "../db/client";
import { getUserIdFromToken } from "./auth";
import { monthlyPriceUsd, monthlyPriceCents, isPaidApiRequired } from "gap-common";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function json(d: unknown, status = 200): Response {
  return new Response(JSON.stringify(d), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

/** Public: monthly price and whether data APIs require subscription (for static sites & pricing pages). */
export function handlePublicPricing(_req: Request): Response {
  return json({
    monthly_price_usd: monthlyPriceUsd(),
    currency: "usd",
    interval: "month",
    require_paid_api: isPaidApiRequired(),
  });
}

function stripeProductName(): string {
  return (process.env.STRIPE_PRODUCT_NAME ?? "API subscription").trim() || "API subscription";
}

function stripeProductDescription(): string {
  const d = process.env.STRIPE_PRODUCT_DESCRIPTION?.trim();
  return d ?? `Monthly access — $${monthlyPriceUsd().toFixed(2)}/mo`;
}

/** Authenticated user: start Stripe Checkout for this product's price. */
export async function handleCreateCheckout(req: Request): Promise<Response> {
  if (!stripe) return json({ error: "Stripe is not configured" }, 503);
  const userId = getUserIdFromToken(req);
  if (!userId || userId === "debug") return json({ error: "Unauthorized" }, 401);
  const user = getUserById(userId);
  if (!user) return json({ error: "Not found" }, 404);

  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  const cents = monthlyPriceCents();
  if (!priceId && cents < 50) return json({ error: "MONTHLY_PRICE_USD too low or invalid" }, 503);

  const success = process.env.STRIPE_SUCCESS_URL ?? `${new URL(req.url).origin}/#/dashboard?billing=success`;
  const cancel = process.env.STRIPE_CANCEL_URL ?? `${new URL(req.url).origin}/#/pricing?billing=cancel`;

  let customerId = user.stripe_customer_id;
  if (!customerId) {
    const c = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } });
    customerId = c.id;
    updateUserStripe(user.id, { stripe_customer_id: customerId, billing_status: "pending" });
  }

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 as const }]
    : [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: stripeProductName(),
              description: stripeProductDescription(),
            },
            unit_amount: cents,
            recurring: { interval: "month" as const },
          },
          quantity: 1 as const,
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

  return json({ url: session.url, monthly_price_usd: monthlyPriceUsd() });
}

function syncUserBillingFromSubscription(sub: Stripe.Subscription): void {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const row = getDb().query<{ id: string }, string>(
    "SELECT id FROM users WHERE stripe_customer_id = ? LIMIT 1"
  ).get(customerId);
  if (!row) return;
  const st = sub.status;
  if (st === "canceled" || st === "incomplete_expired" || st === "unpaid") {
    updateUserStripe(row.id, { billing_status: "canceled", stripe_subscription_id: null });
  } else {
    updateUserStripe(row.id, { stripe_subscription_id: sub.id, billing_status: st });
  }
}

/** Stripe webhooks — raw body required for signature verification. */
export async function handleStripeWebhook(req: Request): Promise<Response> {
  if (!stripe) return json({ error: "Stripe is not configured" }, 503);
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) return json({ error: "STRIPE_WEBHOOK_SECRET not set" }, 503);

  const sig = req.headers.get("stripe-signature");
  if (!sig) return json({ error: "missing signature" }, 400);

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return json({ error: "invalid signature" }, 400);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.metadata?.user_id;
      const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
      if (userId && subId) {
        updateUserStripe(userId, {
          stripe_subscription_id: subId,
          billing_status: "active",
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      syncUserBillingFromSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    case "customer.subscription.deleted":
    case "customer.subscription.canceled": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      const row = getDb().query<{ id: string }, string>(
        "SELECT id FROM users WHERE stripe_customer_id = ? LIMIT 1"
      ).get(customerId);
      if (row) updateUserStripe(row.id, { billing_status: "canceled", stripe_subscription_id: null });
      break;
    }
    default:
      break;
  }

  return json({ received: true });
}
