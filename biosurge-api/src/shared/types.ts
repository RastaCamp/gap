// Disease outbreaks, CDC, ProMED, BirdCast

export type SourceName = "cdc" | "aphis" | "promed" | "birdcast";

export interface Report {
  id: string;
  source: SourceName;
  source_id: string;
  title: string;
  summary: string;
  report_type: string | null;
  location: string | null;
  reported_at: string | null;
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
  report_type: string | null;
  location: string | null;
  reported_at: string | null;
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
