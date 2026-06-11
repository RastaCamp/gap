import { cpSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const gapRoot = join(root, "..", "..");
const frontendDir = join(gapRoot, "groundtruth-seismic-api", "frontend");
const frontendDist = join(frontendDir, "dist");
const outDir = join(root, "dist");

console.log("[build] Installing & building groundtruth frontend…");
if (!existsSync(join(frontendDir, "node_modules"))) {
  execSync("npm install", { cwd: frontendDir, stdio: "inherit" });
}
execSync("npm run build", { cwd: frontendDir, stdio: "inherit" });

if (!existsSync(frontendDist)) {
  throw new Error(`Frontend dist not found at ${frontendDist}`);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(frontendDist, outDir, { recursive: true });

writeFileSync(
  join(outDir, "_redirects"),
  `/api/*  /api/:splat  200\n/*  /index.html  200\n`,
  "utf8"
);

console.log("[build] Output ready at", outDir);
