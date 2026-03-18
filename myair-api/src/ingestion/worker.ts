import type { SourceName, NormalizedRecord } from "../shared/types";
import { fetchAirnow } from "./sources/airnow";
import { fetchRadnet } from "./sources/radnet";
import { fetchTri } from "./sources/tri";
import { fetchUsgsWater } from "./sources/usgs_water";
import { fetchCopernicus } from "./sources/copernicus";
import { runDiff, summarizeUpdate } from "./diff";
import {
  createSyncJob,
  updateSyncJob,
  upsertReading,
  insertDiffLog,
  getDb,
} from "../server/db/client";

const SOURCES: Record<SourceName, () => Promise<NormalizedRecord[]>> = {
  airnow: fetchAirnow,
  radnet: fetchRadnet,
  copernicus: fetchCopernicus,
  tri: fetchTri,
  usgs_water: fetchUsgsWater,
};

/** Comma-separated source ids to skip when running "all" (e.g. DISABLED_SOURCES=copernicus). */
function disabledSources(): Set<string> {
  const raw = process.env.DISABLED_SOURCES ?? "";
  return new Set(raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean));
}

export async function runSource(source: SourceName, jobId: string): Promise<{
  added: number;
  updated: number;
  removed: number;
  snapshotFile: string;
}> {
  const fetchFn = SOURCES[source];
  const freshRecords = await fetchFn();
  if (freshRecords.length === 0 && (source === "airnow" || source === "radnet")) {
    return { added: 0, updated: 0, removed: 0, snapshotFile: "" };
  }

  const diff = runDiff(source, freshRecords);
  const db = getDb();
  const tx = db.transaction(() => {
    let added = 0, updated = 0;
    for (const record of diff.added) {
      const id = crypto.randomUUID();
      if (upsertReading({ ...record, id }) === "inserted") {
        added++;
        insertDiffLog({ job_id: jobId, source: record.source, source_id: record.source_id, action: "added", new_hash: record.content_hash, summary: `New: ${record.title.slice(0, 80)}` });
      }
    }
    for (const { previous, current } of diff.updated) {
      const id = crypto.randomUUID();
      if (upsertReading({ ...current, id }) === "updated") {
        updated++;
        insertDiffLog({ job_id: jobId, source: current.source, source_id: current.source_id, action: "updated", old_hash: previous.content_hash, new_hash: current.content_hash, summary: summarizeUpdate(previous, current) });
      }
    }
    for (const record of diff.removed) {
      insertDiffLog({ job_id: jobId, source: record.source, source_id: record.source_id, action: "removed", old_hash: record.content_hash, summary: "No longer in source" });
    }
    return { added, updated };
  });

  const { added, updated } = tx() as { added: number; updated: number };
  return { added, updated, removed: diff.removed.length, snapshotFile: diff.snapshotFile };
}

export async function runAllSources(): Promise<string> {
  const job = createSyncJob("all");
  let totalAdded = 0, totalUpdated = 0, totalRemoved = 0;
  const snapshotFiles: string[] = [];
  const errors: string[] = [];

  const disabled = disabledSources();
  for (const source of Object.keys(SOURCES) as SourceName[]) {
    if (disabled.has(source.toLowerCase())) continue;
    try {
      const result = await runSource(source, job.id);
      totalAdded += result.added;
      totalUpdated += result.updated;
      totalRemoved += result.removed;
      if (result.snapshotFile) snapshotFiles.push(result.snapshotFile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${source}: ${msg}`);
    }
  }

  updateSyncJob(job.id, {
    status: errors.length === Object.keys(SOURCES).length ? "error" : "success",
    finished_at: new Date().toISOString(),
    records_added: totalAdded,
    records_updated: totalUpdated,
    records_removed: totalRemoved,
    error_message: errors.length ? errors.join("\n") : null,
    snapshot_files: snapshotFiles,
  });
  return job.id;
}

export async function runSingleSource(source: SourceName): Promise<string> {
  if (!SOURCES[source]) throw new Error(`Unknown source: ${source}`);
  const job = createSyncJob(source);
  try {
    const result = await runSource(source, job.id);
    updateSyncJob(job.id, { status: "success", finished_at: new Date().toISOString(), records_added: result.added, records_updated: result.updated, records_removed: result.removed, snapshot_files: result.snapshotFile ? [result.snapshotFile] : [] });
  } catch (err) {
    updateSyncJob(job.id, { status: "error", finished_at: new Date().toISOString(), error_message: err instanceof Error ? err.message : String(err) });
  }
  return job.id;
}

if (import.meta.main) {
  const arg = process.argv[2] as SourceName | "all" | undefined;
  if (arg && arg !== "all" && !SOURCES[arg as SourceName]) {
    console.error(`Unknown source: ${arg}. Valid: all, ${Object.keys(SOURCES).join(", ")}`);
    process.exit(1);
  }
  try {
    if (!arg || arg === "all") await runAllSources();
    else await runSingleSource(arg as SourceName);
  } catch (err) {
    console.error("[worker] Fatal:", err);
    process.exit(1);
  }
}
