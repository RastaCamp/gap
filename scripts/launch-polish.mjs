#!/usr/bin/env node
/**
 * Launch polish: remove public debug UI, guard worker debug-login, inject Stripe buy sections.
 * Usage: node scripts/launch-polish.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const stripe = JSON.parse(readFileSync(join(root, "launch/stripe-products.json"), "utf8"));

const API_DIRS = {
  foodsafe: "foodsafe-api",
  myair: "myair-api",
  gridstatus: "gridstatus-api",
  "groundtruth-seismic": "groundtruth-seismic-api",
  skywatch: "skywatch-api",
  watersafe: "watersafe-api",
  biosurge: "biosurge-api",
  newssignal: "newssignal-api",
  neighborhoodscore: "neighborhoodscore-api",
};

const STRIPE_KEY = stripe.publishableKey;

function walk(dir, ext, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory() && name !== "node_modules" && name !== "dist") walk(p, ext, out);
    else if (name.endsWith(ext)) out.push(p);
  }
  return out;
}

function stripDebugFromLanding(content) {
  return content
    .replace(/\s*<a href="#\/login" class="debug">Debug<\/a>\s*\n?/g, "\n")
    .replace(/\s*\.debug\s*\{[^}]*\}\s*\n?/g, "");
}

function stripDebugFromLogin(content) {
  let c = content.replace(/\s*async function doDebugLogin\(\)[\s\S]*?\n  \}\n/, "\n");
  c = c.replace(/\s*<p class="debug-label">Dev only:<\/p>\s*\n\s*<button class="debug"[^>]*>Debug Login<\/button>\s*\n?/, "");
  c = c.replace(/\s*\.login \.debug-label[\s\S]*?\.login \.debug \{[\s\S]*?\}\s*\n?/, "");
  return c;
}

function guardWorkerRouter(content) {
  if (content.includes("ENABLE_DEBUG_LOGIN")) return content;
  return content.replace(
    /if \(method === "POST" && path === "\/api\/debug-login"\) \{\n    return json\(\{ token: DEBUG_TOKEN,/,
    `if (method === "POST" && path === "/api/debug-login") {
    if (env.ENABLE_DEBUG_LOGIN !== "true") return json({ error: "Not found" }, 404);
    return json({ token: DEBUG_TOKEN,`
  );
}

function stripeBlock(productKey) {
  const map = {
    foodsafe: "foodsafe",
    myair: "myair",
    gridstatus: "gridstatus",
    "groundtruth-seismic": "groundtruth",
    skywatch: "skywatch",
    watersafe: "watersafe",
    biosurge: "biosurge",
    newssignal: "newssignal",
    neighborhoodscore: "neighborhoodscore",
  };
  const p = stripe.gapApis[map[productKey]];
  if (!p?.paymentLink) return "";
  const btn = p.buyButtonId
    ? `<script async src="https://js.stripe.com/v3/buy-button.js"></script>
    <stripe-buy-button
      buy-button-id="${p.buyButtonId}"
      publishable-key="${STRIPE_KEY}"
    ></stripe-buy-button>`
    : "";
  return `
  <section class="subscribe">
    <h2>Subscribe — ${p.price}</h2>
    <p>Pay securely with Stripe. After payment, sign in with the same email to unlock API access.</p>
    <p><a class="pay-link" href="${p.paymentLink}" target="_blank" rel="noopener">Open payment page</a></p>
    ${btn}
  </section>`;
}

function injectPricingStripe(content, productKey) {
  const block = stripeBlock(productKey);
  if (!block) return content;
  if (content.includes("stripe-buy-button") || content.includes("buy.stripe.com")) return content;
  if (content.includes('class="subscribe"')) {
    return content.replace(
      /<section class="subscribe">[\s\S]*?<\/section>/,
      block.trim()
    );
  }
  return content.replace(
    /(\s*<\/section>\s*\n)(\s*<p class="contact">Need a custom plan)/,
    `$1${block}\n$2`
  );
}

function patchEnvTs(content) {
  if (content.includes("ENABLE_DEBUG_LOGIN")) return content;
  return content.replace(
    "STRIPE_CANCEL_URL?: string;",
    "STRIPE_CANCEL_URL?: string;\n  ENABLE_DEBUG_LOGIN?: string;"
  );
}

// Landing + Login
for (const dir of Object.values(API_DIRS)) {
  const base = join(root, dir, "frontend", "src");
  for (const file of ["Landing.svelte", "Login.svelte"]) {
    const p = join(base, file);
    try {
      let c = readFileSync(p, "utf8");
      c = file === "Landing.svelte" ? stripDebugFromLanding(c) : stripDebugFromLogin(c);
      writeFileSync(p, c);
      console.log("[ok]", p);
    } catch {
      /* skip */
    }
  }
  const pricing = join(base, "Pricing.svelte");
  try {
    const key = Object.entries(API_DIRS).find(([, v]) => v === dir)?.[0];
    let c = readFileSync(pricing, "utf8");
    c = injectPricingStripe(c, key);
    if (!c.includes(".subscribe")) {
      c = c.replace(
        "</style>",
        `  .subscribe { margin: 2rem 0; padding: 1.25rem; border: 1px solid #0a7ea4; border-radius: 8px; background: #f0f9fc; }
  .pay-link { display: inline-block; margin-bottom: 0.75rem; font-weight: 600; }
</style>`
      );
    }
    writeFileSync(pricing, c);
    console.log("[ok]", pricing);
  } catch {
    /* skip */
  }
}

// Workers
for (const p of walk(join(root, "deploy"), ".ts")) {
  if (!p.endsWith("router.ts") && !p.endsWith("env.ts")) continue;
  let c = readFileSync(p, "utf8");
  if (p.endsWith("router.ts")) c = guardWorkerRouter(c);
  if (p.endsWith("env.ts")) c = patchEnvTs(c);
  writeFileSync(p, c);
  console.log("[ok]", p);
}

console.log("Launch polish complete.");
