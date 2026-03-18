import type { SourceName, NormalizedRecord } from "../shared/types";
import { fetchNoaaAlerts } from "./sources/noaa_alerts";
import { fetchGdacs } from "./sources/gdacs";
import { runDiff, summarizeUpdate } from "./diff";
import { createSyncJob, updateSyncJob, upsertAlert, insertDiffLog, getDb } from "../server/db/client";

const SOURCES: Record<SourceName, () => Promise<NormalizedRecord[]>> = {
  noaa_alerts: fetchNoaaAlerts,
  gdacs: fetchGdacs,
};

export async function runSource(source: SourceName, jobId: string): Promise<{ added: number; updated: number; removed: number; snapshotFile: string }> {
  const freshRecords = await SOURCES[source]();
  if (freshRecords.length === 0 && source !== "noaa_alerts") return { added: 0, updated: 0, removed: 0, snapshotFile: "" };

  const diff = runDiff(source, freshRecords);
  const result = getDb().transaction(() => {
    let added = 0, updated = 0;
    for (const record of diff.added) {
      if (upsertAlert({ ...record, id: crypto.randomUUID() }) === "inserted") {
        added++;
        insertDiffLog({ job_id: jobId, source: record.source, source_id: record.source_id, action: "added", new_hash: record.content_hash, summary: record.title.slice(0, 80) });
      }
    }
    for (const { previous, current } of diff.updated) {
      if (upsertAlert({ ...current, id: crypto.randomUUID() }) === "updated") {
        updated++;
        insertDiffLog({ job_id: jobId, source: current.source, source_id: current.source_id, action: "updated", old_hash: previous.content_hash, new_hash: current.content_hash, summary: summarizeUpdate(previous, current) });
      }
    }
    for (const record of diff.removed) {
      insertDiffLog({ job_id: jobId, source: record.source, source_id: record.source_id, action: "removed", old_hash: record.content_hash, summary: "No longer in source" });
    }
    return { added, updated };
  })() as { added: number; updated: number };

  return { ...result, removed: diff.removed.length, snapshotFile: diff.snapshotFile };
}

export async function runAllSources(): Promise<string> {
  const job = createSyncJob("all");
  let totalAdded = 0, totalUpdated = 0, totalRemoved = 0;
  const snapshotFiles: string[] = [];
  const errors: string[] = [];

  for (const source of Object.keys(SOURCES) as SourceName[]) {
    try {
      const r = await runSource(source, job.id);
      totalAdded += r.added;
      totalUpdated += r.updated;
      totalRemoved += r.removed;
      if (r.snapshotFile) snapshotFiles.push(r.snapshotFile);
    } catch (err) {
      errors.push(`${source}: ${err instanceof Error ? err.message : String(err)}`);
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
    const r = await runSource(source, job.id);
    updateSyncJob(job.id, { status: "success", finished_at: new Date().toISOString(), records_added: r.added, records_updated: r.updated, records_removed: r.removed, snapshot_files: r.snapshotFile ? [r.snapshotFile] : [] });
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
