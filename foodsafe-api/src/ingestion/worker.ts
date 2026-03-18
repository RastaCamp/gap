import type { SourceName, NormalizedRecord } from "../shared/types";
import { fetchFda } from "./sources/fda";
import { fetchUsda } from "./sources/usda";
import { fetchCdc } from "./sources/cdc";
import { fetchFoodSafety } from "./sources/foodsafety";
import { runDiff, summarizeUpdate } from "./diff";
import {
  createSyncJob, updateSyncJob, upsertRecall,
  insertDiffLog, getDb
} from "../server/db/client";

// ─── Source registry ──────────────────────────────────────────────────────────

const SOURCES: Record<SourceName, () => Promise<NormalizedRecord[]>> = {
  fda:        fetchFda,
  usda:       fetchUsda,
  cdc:        fetchCdc,
  foodsafety: fetchFoodSafety,
};

// ─── Run a single source ──────────────────────────────────────────────────────

export async function runSource(source: SourceName, jobId: string): Promise<{
  added: number;
  updated: number;
  removed: number;
  snapshotFile: string;
}> {
  console.log(`\n[worker] ── Starting source: ${source.toUpperCase()} ──`);

  // 1. Fetch fresh records
  const fetchFn = SOURCES[source];
  const freshRecords = await fetchFn();

  if (freshRecords.length === 0) {
    console.warn(`[worker][${source}] No records returned — skipping diff`);
    return { added: 0, updated: 0, removed: 0, snapshotFile: "" };
  }

  // 2. Diff against last snapshot
  const diff = runDiff(source, freshRecords);

  // 3. Write to DB in a transaction for atomicity
  const db = getDb();
  const tx = db.transaction(() => {
    let added = 0, updated = 0;

    // Process added records
    for (const record of diff.added) {
      const id = crypto.randomUUID();
      const result = upsertRecall({ ...record, id });
      if (result === "inserted") {
        added++;
        insertDiffLog({
          job_id: jobId,
          source: record.source,
          source_id: record.source_id,
          action: "added",
          new_hash: record.content_hash,
          summary: `New recall: ${record.title.slice(0, 80)}`,
        });
      }
    }

    // Process updated records
    for (const { previous, current } of diff.updated) {
      const id = crypto.randomUUID();
      const result = upsertRecall({ ...current, id });
      if (result === "updated") {
        updated++;
        insertDiffLog({
          job_id: jobId,
          source: current.source,
          source_id: current.source_id,
          action: "updated",
          old_hash: previous.content_hash,
          new_hash: current.content_hash,
          summary: summarizeUpdate(previous, current),
        });
      }
    }

    // Log removals (we keep the DB record but log the removal)
    for (const record of diff.removed) {
      insertDiffLog({
        job_id: jobId,
        source: record.source,
        source_id: record.source_id,
        action: "removed",
        old_hash: record.content_hash,
        summary: `No longer present in source feed`,
      });
    }

    return { added, updated };
  });

  const { added, updated } = tx() as { added: number; updated: number };

  return {
    added,
    updated,
    removed: diff.removed.length,
    snapshotFile: diff.snapshotFile,
  };
}

// ─── Run all sources ──────────────────────────────────────────────────────────

export async function runAllSources(): Promise<string> {
  const job = createSyncJob("all");
  console.log(`\n[worker] ════ Sync Job ${job.id} started ════`);

  let totalAdded = 0;
  let totalUpdated = 0;
  let totalRemoved = 0;
  const snapshotFiles: string[] = [];
  const errors: string[] = [];

  for (const source of Object.keys(SOURCES) as SourceName[]) {
    try {
      const result = await runSource(source, job.id);
      totalAdded   += result.added;
      totalUpdated += result.updated;
      totalRemoved += result.removed;
      if (result.snapshotFile) snapshotFiles.push(result.snapshotFile);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[worker][${source}] Error: ${msg}`);
      errors.push(`${source}: ${msg}`);
    }
  }

  const status = errors.length === Object.keys(SOURCES).length ? "error" : "success";

  updateSyncJob(job.id, {
    status,
    finished_at: new Date().toISOString(),
    records_added: totalAdded,
    records_updated: totalUpdated,
    records_removed: totalRemoved,
    error_message: errors.length > 0 ? errors.join("\n") : null,
    snapshot_files: snapshotFiles,
  });

  console.log(
    `\n[worker] ════ Job ${job.id} ${status.toUpperCase()} ════\n` +
    `  Added:   ${totalAdded}\n` +
    `  Updated: ${totalUpdated}\n` +
    `  Removed: ${totalRemoved}\n` +
    (errors.length ? `  Errors:  ${errors.join(", ")}\n` : "")
  );

  return job.id;
}

// ─── Run a specific source only ───────────────────────────────────────────────

export async function runSingleSource(source: SourceName): Promise<string> {
  if (!SOURCES[source]) throw new Error(`Unknown source: ${source}`);

  const job = createSyncJob(source);
  console.log(`\n[worker] ════ Single Source Job: ${source} (${job.id}) ════`);

  try {
    const result = await runSource(source, job.id);
    updateSyncJob(job.id, {
      status: "success",
      finished_at: new Date().toISOString(),
      records_added: result.added,
      records_updated: result.updated,
      records_removed: result.removed,
      snapshot_files: result.snapshotFile ? [result.snapshotFile] : [],
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    updateSyncJob(job.id, {
      status: "error",
      finished_at: new Date().toISOString(),
      error_message: msg,
    });
  }

  return job.id;
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

if (import.meta.main) {
  const arg = process.argv[2] as SourceName | "all" | undefined;

  if (arg && arg !== "all" && !SOURCES[arg as SourceName]) {
    console.error(`Unknown source: ${arg}. Valid: all, ${Object.keys(SOURCES).join(", ")}`);
    process.exit(1);
  }

  try {
    if (!arg || arg === "all") {
      await runAllSources();
    } else {
      await runSingleSource(arg as SourceName);
    }
  } catch (err) {
    console.error("[worker] Fatal error:", err);
    process.exit(1);
  }
}
