import type { NormalizedRecord, SourceName } from "../shared/types";
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const SNAPSHOTS_DIR = join(process.cwd(), "data", "snapshots");

// ─── Snapshot management ──────────────────────────────────────────────────────

export interface Snapshot {
  source: SourceName;
  fetched_at: string;
  record_count: number;
  records: NormalizedRecord[];
}

export function saveSnapshot(source: SourceName, records: NormalizedRecord[]): string {
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `${source}-${ts}.json`;
  const filepath = join(SNAPSHOTS_DIR, filename);

  const snapshot: Snapshot = {
    source,
    fetched_at: new Date().toISOString(),
    record_count: records.length,
    records,
  };

  writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");
  console.log(`[diff] Saved snapshot → ${filename} (${records.length} records)`);
  return filepath;
}

export function loadLatestSnapshot(source: SourceName): Snapshot | null {
  try {
    if (!existsSync(SNAPSHOTS_DIR)) return null;

    const files = readdirSync(SNAPSHOTS_DIR)
      .filter(f => f.startsWith(`${source}-`) && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const content = readFileSync(join(SNAPSHOTS_DIR, files[0]), "utf-8");
    return JSON.parse(content) as Snapshot;
  } catch {
    return null;
  }
}

// Synchronous version to avoid top-level await issues
export function loadLatestSnapshotSync(source: SourceName): Snapshot | null {
  try {
    const { readdirSync } = require("fs");
    if (!existsSync(SNAPSHOTS_DIR)) return null;

    const files = readdirSync(SNAPSHOTS_DIR)
      .filter((f: string) => f.startsWith(`${source}-`) && f.endsWith(".json"))
      .sort()
      .reverse();

    if (files.length === 0) return null;

    const content = readFileSync(join(SNAPSHOTS_DIR, files[0]), "utf-8");
    return JSON.parse(content) as Snapshot;
  } catch {
    return null;
  }
}

// ─── Diff result ──────────────────────────────────────────────────────────────

export interface DiffOutput {
  added: NormalizedRecord[];
  updated: Array<{ previous: NormalizedRecord; current: NormalizedRecord }>;
  removed: NormalizedRecord[];
  unchanged_count: number;
}

// ─── Core diff function ───────────────────────────────────────────────────────

/**
 * Diffs two sets of records by (source, source_id).
 * Returns added, updated (hash changed), removed, and unchanged count.
 *
 * This is O(n) using Maps — handles 100k records comfortably.
 */
export function diffRecords(
  previous: NormalizedRecord[],
  current: NormalizedRecord[]
): DiffOutput {
  // Build lookup maps keyed by source_id
  const prevMap = new Map<string, NormalizedRecord>(
    previous.map(r => [r.source_id, r])
  );
  const currMap = new Map<string, NormalizedRecord>(
    current.map(r => [r.source_id, r])
  );

  const added: NormalizedRecord[] = [];
  const updated: Array<{ previous: NormalizedRecord; current: NormalizedRecord }> = [];
  const removed: NormalizedRecord[] = [];
  let unchanged_count = 0;

  // Check current records against previous
  for (const [id, curr] of currMap) {
    const prev = prevMap.get(id);
    if (!prev) {
      added.push(curr);
    } else if (prev.content_hash !== curr.content_hash) {
      updated.push({ previous: prev, current: curr });
    } else {
      unchanged_count++;
    }
  }

  // Find records in previous but not in current
  for (const [id, prev] of prevMap) {
    if (!currMap.has(id)) {
      removed.push(prev);
    }
  }

  return { added, updated, removed, unchanged_count };
}

// ─── Summarize what changed in an update ─────────────────────────────────────

export function summarizeUpdate(
  prev: NormalizedRecord,
  curr: NormalizedRecord
): string {
  const changes: string[] = [];

  const fields: Array<keyof NormalizedRecord> = [
    "status", "classification", "reason", "distribution_pattern",
    "termination_date", "product_quantity", "recalling_firm",
  ];

  for (const field of fields) {
    if (prev[field] !== curr[field]) {
      changes.push(`${field}: "${prev[field]}" → "${curr[field]}"`);
    }
  }

  return changes.length > 0
    ? changes.join("; ")
    : "Content changed (hash mismatch)";
}

// ─── Full pipeline: fetch → snapshot → diff ───────────────────────────────────

export interface RunDiffResult extends DiffOutput {
  snapshotFile: string;
  previousRecordCount: number;
}

export function runDiff(
  source: SourceName,
  freshRecords: NormalizedRecord[]
): RunDiffResult {
  // Load previous snapshot
  const previous = loadLatestSnapshotSync(source);
  const previousRecords = previous?.records ?? [];

  // Diff
  const diff = diffRecords(previousRecords, freshRecords);

  // Save new snapshot (only after diffing so we don't overwrite with same file)
  const snapshotFile = saveSnapshot(source, freshRecords);

  console.log(
    `[diff][${source}] +${diff.added.length} added, ` +
    `~${diff.updated.length} updated, ` +
    `-${diff.removed.length} removed, ` +
    `=${diff.unchanged_count} unchanged`
  );

  return {
    ...diff,
    snapshotFile,
    previousRecordCount: previousRecords.length,
  };
}
