#!/usr/bin/env node
/** One-off: add mira.rastacamp.com CNAME for Cloudflare tunnel via GitHub token in Actions */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targetsPath = join(root, "launch", "dns-targets.json");
const tunnelId = process.argv[2];
if (!tunnelId) {
  console.error("Usage: node scripts/add-mira-dns-target.mjs <tunnel-id>");
  process.exit(1);
}

const target = `${tunnelId}.cfargotunnel.com`;
const targets = JSON.parse(readFileSync(targetsPath, "utf8"));
const filtered = targets.filter((t) => t.name !== "mira");
filtered.push({ name: "mira", target, domain: "mira.rastacamp.com" });
writeFileSync(targetsPath, JSON.stringify(filtered, null, 2) + "\n");
console.log(`Added mira -> ${target} to dns-targets.json`);

execSync("gh workflow run add-rastacamp-dns.yml -R RastaCamp/gap", { stdio: "inherit" });
console.log("Triggered add-rastacamp-dns.yml — wait ~30s for DNS");
