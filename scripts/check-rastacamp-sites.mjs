#!/usr/bin/env node
/** Quick HTTP status check for all rastacamp.com targets */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = JSON.parse(readFileSync(join(root, "launch/dns-targets.json"), "utf8"));

const results = [];
for (const { name, domain } of targets) {
  try {
    const res = await fetch(`https://${domain}/`, { method: "HEAD", redirect: "follow" });
    results.push({ name, domain, status: res.status, ok: res.ok });
  } catch (e) {
    results.push({ name, domain, status: "ERR", ok: false, error: e.message });
  }
}

for (const r of results) {
  const mark = r.ok ? "OK" : "FAIL";
  console.log(`${mark}  ${r.status}\t${r.domain} (${r.name})${r.error ? " " + r.error : ""}`);
}
const failed = results.filter((r) => !r.ok);
process.exit(failed.length ? 1 : 0);
