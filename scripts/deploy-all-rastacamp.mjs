#!/usr/bin/env node
/**
 * Full deploy: D1 (if needed), Pages project, schema, build, deploy, custom domain.
 * Usage: node scripts/deploy-all-rastacamp.mjs [app ...]
 * Requires: wrangler login (djudo82), CLOUDFLARE_ACCOUNT_ID=5cc38e7e9de459dac0187eb7ddf3063c
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deployRoot = join(root, "deploy");
const stripe = JSON.parse(readFileSync(join(root, "launch/stripe-products.json"), "utf8"));

const APPS = [
  "myair",
  "gridstatus",
  "foodsafe",
  "watersafe",
  "biosurge",
  "skywatch",
  "newssignal",
  "neighborhoodscore",
  "groundtruth",
];

const SUBDOMAIN = {
  groundtruth: "groundtruth.rastacamp.com",
};

function run(cmd, cwd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "5cc38e7e9de459dac0187eb7ddf3063c" } });
}

function sh(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8", env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || "5cc38e7e9de459dac0187eb7ddf3063c" } }).trim();
}

function ensureD1(appDir, app) {
  const toml = join(appDir, "wrangler.toml");
  let content = readFileSync(toml, "utf8");
  if (content.includes("REPLACE_AFTER_D1_CREATE")) {
    console.log(`[${app}] Creating D1 database...`);
    const out = sh("npx wrangler d1 create " + app + "-db", appDir);
    const m = out.match(/database_id = "([^"]+)"/);
    if (!m) throw new Error("Could not parse D1 id from wrangler output");
    content = content.replace(/database_id = "REPLACE_AFTER_D1_CREATE"/, `database_id = "${m[1]}"`);
    writeFileSync(toml, content);
    console.log(`[${app}] D1 id ${m[1]}`);
  }
}

function ensurePagesProject(appDir, app) {
  const list = JSON.parse(sh("npx wrangler pages project list --json", appDir));
  if (!list.some((p) => p["Project Name"] === app)) {
    console.log(`[${app}] Creating Pages project...`);
    run(`npx wrangler pages project create ${app} --production-branch=main`, appDir);
  }
}

function getPagesDevHost(appDir, app) {
  const list = JSON.parse(sh("npx wrangler pages project list --json", appDir));
  const proj = list.find((p) => p["Project Name"] === app);
  if (!proj) return `${app}.pages.dev`;
  const domains = (proj["Project Domains"] || "").split(",").map((s) => s.trim());
  return domains.find((d) => d.endsWith(".pages.dev")) || `${app}.pages.dev`;
}

function readOAuthToken() {
  const cfg = readFileSync(
    join(process.env.APPDATA || "", "xdg.config", ".wrangler", "config", "default.toml"),
    "utf8"
  );
  return cfg.match(/oauth_token = "([^"]+)"/)[1];
}

function addCustomDomain(app, domain) {
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID || "5cc38e7e9de459dac0187eb7ddf3063c";
  const token = readOAuthToken();
  const url = `https://api.cloudflare.com/client/v4/accounts/${acct}/pages/projects/${app}/domains`;
  try {
    execSync(
      `curl -s -X POST "${url}" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d "{\\"name\\":\\"${domain}\\"}"`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    console.log(`[${app}] Custom domain ${domain} requested`);
  } catch {
    console.log(`[${app}] Custom domain may already exist`);
  }
}

function addDnsCname(name, target, token) {
  const zone = "cf52be49bca453715fc5e899b6941fef";
  const check = execSync(
    `curl -s "https://api.cloudflare.com/client/v4/zones/${zone}/dns_records?type=CNAME&name=${name}.rastacamp.com" -H "Authorization: Bearer ${token}"`,
    { encoding: "utf8" }
  );
  const parsed = JSON.parse(check);
  if (parsed.result?.length > 0) {
    console.log(`[dns] ${name}.rastacamp.com already exists → ${parsed.result[0].content}`);
    return;
  }
  const body = JSON.stringify({ type: "CNAME", name, content: target, proxied: true, ttl: 1 });
  const res = execSync(
    `curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${zone}/dns_records" -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${body.replace(/'/g, "'\\''")}'`,
    { encoding: "utf8" }
  );
  console.log(`[dns] ${name}:`, res.slice(0, 120));
}

const selected = process.argv.slice(2).length ? process.argv.slice(2) : APPS;
const dnsTargets = [];

for (const app of selected) {
  const appDir = join(deployRoot, app);
  if (!existsSync(appDir)) {
    console.warn(`Skip ${app}: no deploy/${app}`);
    continue;
  }
  console.log(`\n========== ${app} ==========`);
  if (!existsSync(join(appDir, "node_modules"))) run("npm install", appDir);
  ensureD1(appDir, app);
  ensurePagesProject(appDir, app);
  try {
    run("npm run db:migrate", appDir);
  } catch {
    console.warn(`[${app}] db:migrate skipped or failed (may be ok)`);
  }
  run("npm run deploy", appDir);
  const domain = SUBDOMAIN[app] || `${app}.rastacamp.com`;
  addCustomDomain(app, domain);
  const pagesHost = getPagesDevHost(appDir, app);
  dnsTargets.push({ name: app, target: pagesHost, domain });
}

console.log("\n========== DNS (Leerie zone) ==========");
console.log("If OAuth lacks DNS edit, run: gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap");
console.log("Targets:", dnsTargets);

try {
  const token = readOAuthToken();
  for (const { name, target } of dnsTargets) {
    addDnsCname(name, target, token);
  }
} catch (e) {
  console.warn("DNS via OAuth failed — use GitHub workflow with RastaCamp token:", e.message);
}

writeFileSync(join(root, "launch/dns-targets.json"), JSON.stringify(dnsTargets, null, 2));
console.log("\nWrote launch/dns-targets.json");
console.log("Done.");
