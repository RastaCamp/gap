// ─── Canonical reading/alert record stored in DB (MyAir) ─────────────────────

export type SourceName = "airnow" | "radnet" | "copernicus" | "tri" | "usgs_water";

export interface Reading {
  id: string;
  source: SourceName;
  source_id: string;
  title: string;
  summary: string;
  location_name: string | null;
  location_zip: string | null;
  latitude: number | null;
  longitude: number | null;
  value: number | null;
  unit: string | null;
  category: string;
  observed_at: string | null;
  source_url: string | null;
  raw_json: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
}

export interface NormalizedRecord {
  source: SourceName;
  source_id: string;
  title: string;
  summary: string;
  location_name: string | null;
  location_zip: string | null;
  latitude: number | null;
  longitude: number | null;
  value: number | null;
  unit: string | null;
  category: string;
  observed_at: string | null;
  source_url: string | null;
  raw_json: string;
  content_hash: string;
}

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

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    per_page: number;
    source_counts: Record<string, number>;
  };
}
