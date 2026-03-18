import { initDb } from "./client";
import { mkdirSync } from "fs";
import { join } from "path";
for (const dir of ["data", "data/snapshots", "data/logs"]) mkdirSync(join(process.cwd(), dir), { recursive: true });
initDb();
console.log("[init] Database ready at data/neighborhoodscore.db");
