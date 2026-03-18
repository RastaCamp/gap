// ─── Canonical recall record stored in DB ────────────────────────────────────

export type RecallStatus = "ongoing" | "completed" | "terminated" | "unknown";
export type RecallClassification = "Class I" | "Class II" | "Class III" | "unknown";
export type SourceName = "fda" | "usda" | "cdc" | "foodsafety";

export interface Recall {
  id: string;                        // internal UUID
  source: SourceName;
  source_id: string;                 // original ID from source
  title: string;
  reason: string;
  classification: RecallClassification;
  status: RecallStatus;
  recalling_firm: string;
  product_description: string;
  product_quantity: string | null;
  distribution_pattern: string | null;
  states_affected: string[];         // parsed from distribution text
  recall_initiation_date: string | null;   // ISO 8601
  termination_date: string | null;
  center_classification_date: string | null;
  report_date: string | null;
  source_url: string | null;
  raw_json: string;                  // original payload stringified
  content_hash: string;              // sha256 of normalized content for diffing
  created_at: string;
  updated_at: string;
}

// ─── Diff result produced by the diff engine ─────────────────────────────────

export interface DiffResult {
  source: SourceName;
  run_id: string;
  fetched_at: string;
  added: NormalizedRecord[];
  updated: Array<{ previous: NormalizedRecord; current: NormalizedRecord }>;
  removed: NormalizedRecord[];
  unchanged_count: number;
  snapshot_file: string;
}

// ─── Raw normalized record before DB insert ───────────────────────────────────

export interface NormalizedRecord {
  source: SourceName;
  source_id: string;
  title: string;
  reason: string;
  classification: RecallClassification;
  status: RecallStatus;
  recalling_firm: string;
  product_description: string;
  product_quantity: string | null;
  distribution_pattern: string | null;
  recall_initiation_date: string | null;
  termination_date: string | null;
  report_date: string | null;
  source_url: string | null;
  raw_json: string;
  content_hash: string;
}

// ─── Sync job record ──────────────────────────────────────────────────────────

export type JobStatus = "pending" | "running" | "success" | "error";

export interface SyncJob {
  id: string;
  source: SourceName | "all";
  status: JobStatus;
  started_at: string;
  finished_at: string | null;
  records_added: number;
  records_updated: number;
  records_removed: number;
  error_message: string | null;
  snapshot_files: string[];
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    per_page: number;
    source_counts: Record<string, number>;
  };
}

export interface AdminSyncResponse {
  job_id: string;
  status: JobStatus;
  message: string;
}
