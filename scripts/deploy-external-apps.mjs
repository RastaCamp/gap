#!/usr/bin/env node
/**
 * Build + deploy external RastaCamp apps to Cloudflare Pages (djudo82 account).
 * Usage: node scripts/deploy-external-apps.mjs [align|crumble|audiobook-creator|quotes|ascension|all]
 */
import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const gapRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const projectsRoot = join(gapRoot, "..");
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || "5cc38e7e9de459dac0187eb7ddf3063c";

function wranglerEnv() {
  const cache = process.env.XDG_CACHE_HOME || join(process.env.APPDATA || "", "xdg.cache");
  return { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId, XDG_CACHE_HOME: cache };
}

function sh(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8", env: wranglerEnv(), shell: true }).trim();
}

function ensurePagesProject(deployDir, project) {
  const wranglerCwd = join(gapRoot, "deploy", "myair");
  const list = JSON.parse(sh("npx --yes wrangler@4 pages project list --json", wranglerCwd));
  if (!list.some((p) => p["Project Name"] === project)) {
    console.log(`[pages] Creating project ${project}...`);
    execSync(`npx --yes wrangler@4 pages project create ${project} --production-branch=main`, {
      cwd: wranglerCwd,
      stdio: "inherit",
      env: wranglerEnv(),
      shell: true,
    });
  }
}

const APPS = {
  align: {
    stripeKey: "align",
    project: "align",
    source: join(projectsRoot, "align"),
    build() {
      if (!existsSync(join(this.source, "node_modules"))) {
        execSync("npm install", { cwd: this.source, stdio: "inherit" });
      }
      execSync("npm run build", { cwd: this.source, stdio: "inherit" });
      return join(this.source, "dist");
    },
  },
  crumble: {
    stripeKey: "crumble",
    project: "crumble",
    source: join(projectsRoot, "crumble", "apps", "web"),
    build() {
      if (!existsSync(join(this.source, "node_modules"))) {
        execSync("npm install", { cwd: this.source, stdio: "inherit" });
      }
      execSync("npm run build", { cwd: this.source, stdio: "inherit" });
      return join(this.source, "dist");
    },
  },
  "audiobook-creator": {
    stripeKey: "audiobook-creator",
    project: "audiobook-creator",
    source: join(projectsRoot, "audio book creator", "web"),
    build() {
      if (!existsSync(join(this.source, "node_modules"))) {
        execSync("npm install", { cwd: this.source, stdio: "inherit" });
      }
      execSync("npm run build", { cwd: this.source, stdio: "inherit" });
      return join(this.source, "dist");
    },
  },
  quotes: {
    stripeKey: "quotes",
    project: "quotes",
    source: join(projectsRoot, "quotes_manager"),
    build() {
      const webOut = join(this.source, "build", "web");
      if (existsSync(webOut)) return webOut;
      execSync("flutter build web --release", { cwd: this.source, stdio: "inherit" });
      if (!existsSync(webOut)) throw new Error("Flutter web build missing at " + webOut);
      return webOut;
    },
  },
  ascension: {
    stripeKey: "ascension",
    project: "ascensions",
    source: join(projectsRoot, "suite", "automoney", "ascension-cards"),
    build() {
      const out = join(gapRoot, "deploy", "ascension", "dist");
      rmSync(out, { recursive: true, force: true });
      mkdirSync(out, { recursive: true });
      cpSync(join(this.source, "index.html"), join(out, "index.html"));
      cpSync(join(this.source, "cards"), join(out, "cards"), { recursive: true });
      cpSync(join(this.source, "audio"), join(out, "audio"), { recursive: true });
      return out;
    },
  },
};

function prepareDist(appKey, app, srcDist) {
  const deployDir = join(gapRoot, "deploy", appKey === "ascension" ? "ascension" : appKey);
  const outDir = join(deployDir, "dist");
  if (appKey !== "ascension") {
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(outDir, { recursive: true });
    cpSync(srcDist, outDir, { recursive: true });
  }
  writeFileSync(join(outDir, "_redirects"), "/*  /index.html  200\n", "utf8");

  const stripe = JSON.parse(readFileSync(join(gapRoot, "launch/stripe-products.json"), "utf8"));
  const product = stripe.appsAndGames[app.stripeKey];
  if (product?.paymentLink) {
    const landing = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${app.project} — Pro</title>
<meta http-equiv="refresh" content="0;url=${product.paymentLink}"></head>
<body><p><a href="${product.paymentLink}">Subscribe on Stripe</a></p></body></html>`;
    writeFileSync(join(outDir, "pro.html"), landing, "utf8");
  }

  if (appKey !== "ascension") {
    execSync(`node scripts/inject-app-stripe.mjs ${app.stripeKey} "${join(outDir, "index.html")}"`, {
      cwd: gapRoot,
      stdio: "inherit",
    });
  }

  return outDir;
}

function deployApp(appKey) {
  const app = APPS[appKey];
  if (!app) throw new Error("Unknown app: " + appKey);
  if (!existsSync(app.source)) throw new Error(`Source not found: ${app.source}`);

  console.log(`\n========== ${appKey} ==========`);
  const srcDist = app.build();
  const outDir = prepareDist(appKey, app, srcDist);

  const deployDir = join(gapRoot, "deploy", appKey === "ascension" ? "ascension" : appKey);
  mkdirSync(deployDir, { recursive: true });
  ensurePagesProject(deployDir, app.project);

  const args = [
    "npx",
    "--yes",
    "wrangler@4",
    "pages",
    "deploy",
    outDir,
    "--project-name=" + app.project,
    "--branch=main",
    "--commit-dirty=true",
  ].join(" ");

  console.log("[deploy]", args);
  execSync(args, {
    cwd: join(gapRoot, "deploy", "myair"),
    stdio: "inherit",
    shell: true,
    env: wranglerEnv(),
  });
  console.log(`[deploy] ${appKey} → https://${app.project}.pages.dev`);
}

const target = process.argv[2] || "all";
const keys = target === "all" ? Object.keys(APPS) : [target];
for (const key of keys) deployApp(key);
