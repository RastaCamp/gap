import { readFileSync } from "node:fs";
import { join } from "node:path";

const cfg = readFileSync(join(process.env.APPDATA, "xdg.config", ".wrangler", "config", "default.toml"), "utf8");
const token = cfg.match(/oauth_token = "([^"]+)"/)[1];
const acct = "5cc38e7e9de459dac0187eb7ddf3063c";

for (const p of ["punchie-rc", "terrorwell", "align", "ascensions"]) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${acct}/pages/projects/${p}/domains`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  console.log(p, (j.result || []).map((x) => `${x.name} (${x.status})`).join(", ") || j.errors);
}
