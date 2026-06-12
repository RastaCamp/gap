#!/usr/bin/env node
/** Ensure Stripe webhook + Pages secrets for BioSurge */
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret?.startsWith("sk_")) {
  console.error("Set STRIPE_SECRET_KEY");
  process.exit(1);
}

const webhookUrl = "https://biosurge.rastacamp.com/api/webhooks/stripe";
const events = [
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted",
];

async function api(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  return res.json();
}

const list = await api("GET", "/webhook_endpoints?limit=100");
let endpoint = list.data?.find((e) => e.url === webhookUrl);

if (!endpoint) {
  const body = { url: webhookUrl, enabled_events: events };
  const params = new URLSearchParams({ url: webhookUrl });
  events.forEach((ev, i) => params.set(`enabled_events[${i}]`, ev));
  endpoint = await api("POST", "/webhook_endpoints", Object.fromEntries(params));
  if (endpoint.error) throw new Error(endpoint.error.message);
  console.log("[webhook] created", endpoint.id);
} else {
  console.log("[webhook] exists", endpoint.id);
}

console.log("STRIPE_WEBHOOK_SECRET=" + endpoint.secret);
