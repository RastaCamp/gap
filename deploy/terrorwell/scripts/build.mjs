import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gapRoot = join(root, "..", "..");
const appDir = join(gapRoot, "..", "TerrorWell");
const webDist = join(appDir, "dist");
const outDir = join(root, "dist");

if (!existsSync(appDir)) {
  throw new Error(`TerrorWell not found at ${appDir}`);
}

console.log("[build] Exporting TerrorWell web from", appDir);
if (!existsSync(join(appDir, "node_modules"))) {
  execSync("npm install", { cwd: appDir, stdio: "inherit" });
}

execSync("npx expo export -p web", {
  cwd: appDir,
  stdio: "inherit",
  env: { ...process.env, EXPO_PUBLIC_DEV_PRO: "false" },
});

if (!existsSync(webDist)) {
  throw new Error(`Expo web dist not found at ${webDist}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(webDist, outDir, { recursive: true });

writeFileSync(join(outDir, "_redirects"), "/*  /index.html  200\n", "utf8");

const stripe = JSON.parse(readFileSync(join(gapRoot, "launch/stripe-products.json"), "utf8"));
const link = stripe.appsAndGames.terrorwell.paymentLink;
const landing = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TerrorWell — Get Pro</title>
<meta http-equiv="refresh" content="0;url=${link}"></head>
<body><p><a href="${link}">TerrorWell Pro on Stripe</a></p></body></html>`;
writeFileSync(join(outDir, "pro.html"), landing, "utf8");

console.log("[build] Output ready at", outDir);
