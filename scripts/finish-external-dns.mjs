#!/usr/bin/env node
/** Add Pages custom domains + update DNS for new external apps */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const accountId = "5cc38e7e9de459dac0187eb7ddf3063c";
const zoneId = "cf52be49bca453715fc5e899b6941fef";
const cache = join(process.env.APPDATA || "", "xdg.cache");
const wranglerCwd = join(root, "deploy", "myair");
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId, XDG_CACHE_HOME: cache };

function sh(cmd) {
  return execSync(cmd, { cwd: wranglerCwd, encoding: "utf8", env, shell: true }).trim();
}

function token() {
  const cfg = readFileSync(join(process.env.APPDATA || "", "xdg.config", ".wrangler", "config", "default.toml"), "utf8");
  return cfg.match(/oauth_token = "([^"]+)"/)[1];
}

async function cf(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

const NEW = [
  { project: "align", name: "align", dnsName: "align", domain: "align.rastacamp.com" },
  { project: "crumble", name: "crumble", dnsName: "crumble", domain: "crumble.rastacamp.com" },
  { project: "audiobook-creator", name: "audiobook-creator", dnsName: "audiobook", domain: "audiobook.rastacamp.com" },
  { project: "quotes", name: "quotes", dnsName: "quotes", domain: "quotes.rastacamp.com" },
  { project: "ascensions", name: "ascension", dnsName: "ascension", domain: "ascension.rastacamp.com" },
  { project: "punchie-rc", name: "punchie", dnsName: "punchie", domain: "punchie.rastacamp.com" },
  { project: "terrorwell", name: "terrorwell", dnsName: "terrorwell", domain: "terrorwell.rastacamp.com" },
];

const list = JSON.parse(sh("npx --yes wrangler@4 pages project list --json"));

for (const item of NEW) {
  const proj = list.find((p) => p["Project Name"] === item.project);
  const domains = (proj?.["Project Domains"] || "").split(",").map((s) => s.trim());
  item.target = domains.find((d) => d.endsWith(".pages.dev")) || `${item.project}.pages.dev`;

  const domRes = await cf("POST", `/accounts/${accountId}/pages/projects/${item.project}/domains`, { name: item.domain });
  console.log(`[domain] ${item.domain}:`, domRes.success ? "ok" : domRes.errors?.[0]?.message || domRes);

  const dnsList = await cf("GET", `/zones/${zoneId}/dns_records?type=CNAME&name=${item.domain}`);
  const rec = dnsList.result?.[0];
  const payload = { type: "CNAME", name: item.dnsName, content: item.target, proxied: true, ttl: 1 };
  if (rec) {
    if (rec.content === item.target) console.log(`[dns] ${item.domain} already → ${item.target}`);
    else {
      const upd = await cf("PUT", `/zones/${zoneId}/dns_records/${rec.id}`, payload);
      console.log(`[dns] updated ${item.domain} → ${item.target}:`, upd.success ? "ok" : upd.errors);
    }
  } else {
    const crt = await cf("POST", `/zones/${zoneId}/dns_records`, payload);
    console.log(`[dns] created ${item.domain} → ${item.target}:`, crt.success ? "ok" : crt.errors);
  }
}

const existing = JSON.parse(readFileSync(join(root, "launch/dns-targets.json"), "utf8"));
const merged = [
  ...existing.filter((e) => !NEW.some((n) => n.name === e.name)),
  ...NEW.map(({ name, target, domain }) => ({ name, target, domain })),
];
writeFileSync(join(root, "launch/dns-targets.json"), JSON.stringify(merged, null, 2) + "\n");
console.log("Updated launch/dns-targets.json");
