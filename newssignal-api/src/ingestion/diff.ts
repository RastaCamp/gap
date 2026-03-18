import type { NormalizedRecord, SourceName } from "../shared/types";
import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import { join } from "path";

const SNAPSHOTS_DIR = join(process.cwd(), "data", "snapshots");

export interface Snapshot {
  source: SourceName;
  fetched_at: string;
  record_count: number;
  records: NormalizedRecord[];
}

export function saveSnapshot(source: SourceName, records: NormalizedRecord[]): string {
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filepath = join(SNAPSHOTS_DIR, `${source}-${ts}.json`);
  writeFileSync(filepath, JSON.stringify({ source, fetched_at: new Date().toISOString(), record_count: records.length, records }, null, 2), "utf-8");
  return filepath;
}

export function loadLatestSnapshotSync(source: SourceName): Snapshot | null {
  try {
    if (!existsSync(SNAPSHOTS_DIR)) return null;
    const files = readdirSync(SNAPSHOTS_DIR).filter((f: string) => f.startsWith(source + "-") && f.endsWith(".json")).sort().reverse();
    if (files.length === 0) return null;
    return JSON.parse(readFileSync(join(SNAPSHOTS_DIR, files[0]), "utf-8")) as Snapshot;
  } catch { return null; }
}

export interface DiffOutput {
  added: NormalizedRecord[];
  updated: Array<{ previous: NormalizedRecord; current: NormalizedRecord }>;
  removed: NormalizedRecord[];
  unchanged_count: number;
}

export function diffRecords(previous: NormalizedRecord[], current: NormalizedRecord[]): DiffOutput {
  const prevMap = new Map(previous.map(r => [r.source_id, r]));
  const currMap = new Map(current.map(r => [r.source_id, r]));
  const added: NormalizedRecord[] = [];
  const updated: Array<{ previous: NormalizedRecord; current: NormalizedRecord }> = [];
  const removed: NormalizedRecord[] = [];
  let unchanged_count = 0;
  for (const [id, curr] of currMap) {
    const prev = prevMap.get(id);
    if (!prev) added.push(curr);
    else if (prev.content_hash !== curr.content_hash) updated.push({ previous: prev, current: curr });
    else unchanged_count++;
  }
  for (const [id, prev] of prevMap) { if (!currMap.has(id)) removed.push(prev); }
  return { added, updated, removed, unchanged_count };
}

export function summarizeUpdate(prev: NormalizedRecord, curr: NormalizedRecord): string {
  const changes: string[] = [];
  for (const k of ["title", "severity", "effective_at", "expires_at"] as const) {
    if (prev[k] !== curr[k]) changes.push(`${k}: ${prev[k]} → ${curr[k]}`);
  }
  return changes.length ? changes.join("; ") : "Content changed";
}

export interface RunDiffResult extends DiffOutput { snapshotFile: string; previousRecordCount: number; }

export function runDiff(source: SourceName, freshRecords: NormalizedRecord[]): RunDiffResult {
  const previous = loadLatestSnapshotSync(source);
  const diff = diffRecords(previous?.records ?? [], freshRecords);
  const snapshotFile = saveSnapshot(source, freshRecords);
  return { ...diff, snapshotFile, previousRecordCount: previous?.record_count ?? 0 };
}
