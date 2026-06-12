#!/usr/bin/env node
/** Create BioSurge Stripe Payment Link, update stripe-products.json, run launch-polish */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret?.startsWith("sk_")) {
  console.error("Set STRIPE_SECRET_KEY");
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

const successUrl = "https://biosurge.rastacamp.com/#/login?subscribed=1";

async function main() {
  const stripePath = join(root, "launch/stripe-products.json");
  const catalog = JSON.parse(readFileSync(stripePath, "utf8"));
  if (catalog.gapApis.biosurge?.paymentLink) {
    console.log("[skip] BioSurge payment link already configured:", catalog.gapApis.biosurge.paymentLink);
  } else {
    const product = await api("POST", "/products", {
      name: "BioSurge API",
      description: "Monthly API access — outbreak intelligence & health signals",
      "metadata[gap_api]": "biosurge",
    });
    const price = await api("POST", "/prices", {
      product: product.id,
      currency: "usd",
      "recurring[interval]": "month",
      unit_amount: "1999",
    });
    const pl = await api("POST", "/payment_links", {
      "line_items[0][price]": price.id,
      "line_items[0][quantity]": "1",
      "after_completion[type]": "redirect",
      "after_completion[redirect][url]": successUrl,
      "metadata[gap_api]": "biosurge",
    });
    catalog.gapApis.biosurge = {
      subdomain: "biosurge.rastacamp.com",
      price: "$19.99/mo",
      buyButtonId: null,
      paymentLink: pl.url,
      successRedirect: successUrl,
      stripePriceId: price.id,
    };
    writeFileSync(stripePath, JSON.stringify(catalog, null, 2) + "\n");
    console.log("[payment_link]", pl.url);
  }

  execSync("node scripts/launch-polish.mjs", { cwd: root, stdio: "inherit" });
  console.log("[ok] launch-polish applied");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
