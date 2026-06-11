#!/usr/bin/env node
/** Inject Stripe buy button + pricing bar into built index.html */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripe = JSON.parse(readFileSync(join(root, "launch/stripe-products.json"), "utf8"));

const appKey = process.argv[2];
const distIndex = process.argv[3];
if (!appKey || !distIndex) {
  console.error("Usage: node scripts/inject-app-stripe.mjs <stripe-key> <path/to/dist/index.html>");
  process.exit(1);
}

const product = stripe.appsAndGames[appKey];
if (!product?.buyButtonId) {
  console.log(`[stripe] Skip ${appKey}: no buyButtonId`);
  process.exit(0);
}

if (!existsSync(distIndex)) {
  console.error(`[stripe] Missing ${distIndex}`);
  process.exit(1);
}

let html = readFileSync(distIndex, "utf8");
if (html.includes("rastacamp-stripe-bar")) {
  console.log("[stripe] Already injected");
  process.exit(0);
}

const bar = `
<div id="rastacamp-stripe-bar" class="rastacamp-stripe-bar" style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0f172a;color:#e2e8f0;padding:0.65rem 1rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:0.75rem;font-family:system-ui,sans-serif;font-size:0.9rem;box-shadow:0 -4px 24px rgba(0,0,0,0.35);">
  <span><strong>Pro</strong> — ${product.price} · <a href="${product.paymentLink}" target="_blank" rel="noopener" style="color:#93c5fd">Pay with Stripe</a></span>
  <script async src="https://js.stripe.com/v3/buy-button.js"></script>
  <stripe-buy-button buy-button-id="${product.buyButtonId}" publishable-key="${stripe.publishableKey}"></stripe-buy-button>
</div>
<style>body{padding-bottom:4.5rem!important}</style>
`;

html = html.replace("</body>", `${bar}\n</body>`);
writeFileSync(distIndex, html);
console.log(`[stripe] Injected buy button for ${appKey} into ${distIndex}`);
