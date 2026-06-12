#!/usr/bin/env node
/**
 * Set after-payment redirect URL on Stripe Payment Links.
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-stripe-payment-links.mjs [app-key ...]
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-stripe-payment-links.mjs ascension
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripe = JSON.parse(readFileSync(join(root, "launch/stripe-products.json"), "utf8"));
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret?.startsWith("sk_")) {
  console.error("Set STRIPE_SECRET_KEY (sk_live_... or sk_test_...) in the environment.");
  process.exit(1);
}

const SUCCESS_URLS = {
  ascension: "https://ascension.rastacamp.com/?purchase=success",
  align: "https://align.rastacamp.com/?purchase=success",
  crumble: "https://crumble.rastacamp.com/?purchase=success",
  "audiobook-creator": "https://audiobook.rastacamp.com/?purchase=success",
  quotes: "https://quotes.rastacamp.com/?purchase=success",
  terrorwell: "https://terrorwell.rastacamp.com/?purchase=success",
  "rep-battle": "https://repbattle.rastacamp.com/?purchase=success",
  punchie: "https://punchie.rastacamp.com/?purchase=success",
};

// GAP APIs: redirect to login after subscribe
for (const [key, p] of Object.entries(stripe.gapApis)) {
  if (p.subdomain && p.paymentLink) {
    SUCCESS_URLS[key] = `https://${p.subdomain}/#/login?subscribed=1`;
  }
}

const keys = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...Object.keys(stripe.appsAndGames), ...Object.keys(stripe.gapApis).filter((k) => stripe.gapApis[k].paymentLink)];

async function stripeApi(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

async function listAllPaymentLinks() {
  const out = [];
  let starting_after;
  for (;;) {
    const q = new URLSearchParams({ limit: "100", active: "true" });
    if (starting_after) q.set("starting_after", starting_after);
    const page = await stripeApi("GET", `/payment_links?${q}`);
    out.push(...page.data);
    if (!page.has_more) break;
    starting_after = page.data.at(-1).id;
  }
  return out;
}

function productForKey(key) {
  return stripe.appsAndGames[key] || stripe.gapApis[key];
}

async function main() {
  const links = await listAllPaymentLinks();
  for (const key of keys) {
    const product = productForKey(key);
    const successUrl = SUCCESS_URLS[key];
    if (!product?.paymentLink) {
      console.warn(`[skip] ${key}: no paymentLink in stripe-products.json`);
      continue;
    }
    if (!successUrl) {
      console.warn(`[skip] ${key}: no success URL configured`);
      continue;
    }
    const link = links.find((l) => l.url === product.paymentLink || l.url?.includes(product.paymentLink.split("/").pop()));
    if (!link) {
      console.error(`[fail] ${key}: could not find payment link ${product.paymentLink}`);
      continue;
    }
    const updated = await stripeApi("POST", `/payment_links/${link.id}`, {
      "after_completion[type]": "redirect",
      "after_completion[redirect][url]": successUrl,
    });
    console.log(`[ok] ${key}: ${link.url}`);
    console.log(`     redirect → ${updated.after_completion?.redirect?.url || successUrl}`);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
