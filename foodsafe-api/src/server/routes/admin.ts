import { getRecentJobs, getSyncJob, getDiffLog, getStats } from "../db/client";
import { runAllSources, runSingleSource } from "../../ingestion/worker";
import type { SourceName } from "../../shared/types";

// Track running jobs in memory to prevent duplicate simultaneous syncs
const runningJobs = new Set<string>();

// ─── POST /api/admin/sync ─────────────────────────────────────────────────────
// Body (optional): { source: "all" | "fda" | "usda" | "cdc" | "foodsafety" }
// Triggers async ingestion and returns job_id immediately.

export async function handleSync(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({})) as { source?: string };
  const source = (body.source ?? "all") as SourceName | "all";

  const validSources = ["all", "fda", "usda", "cdc", "foodsafety"];
  if (!validSources.includes(source)) {
    return json({ error: `Invalid source. Must be one of: ${validSources.join(", ")}` }, 400);
  }

  // Check if already running
  if (runningJobs.has(source)) {
    return json({
      error: `Sync already running for source: ${source}`,
      status: "running",
    }, 409);
  }

  // Start async — don't await, return job_id immediately
  runningJobs.add(source);

  const jobPromise = source === "all"
    ? runAllSources()
    : runSingleSource(source as SourceName);

  jobPromise
    .then(jobId => {
      console.log(`[admin] Sync job ${jobId} completed`);
      runningJobs.delete(source);
    })
    .catch(err => {
      console.error(`[admin] Sync job failed:`, err);
      runningJobs.delete(source);
    });

  // We need to get the job ID — since the worker creates it first, wait briefly
  await Bun.sleep(100);

  return json({
    status: "started",
    message: `Sync started for source: ${source}. Poll /api/admin/jobs for status.`,
    source,
  });
}

// ─── GET /api/admin/jobs ──────────────────────────────────────────────────────

export async function handleJobs(_req: Request): Promise<Response> {
  const jobs = getRecentJobs(30);
  return json({ data: jobs, meta: { count: jobs.length } });
}

// ─── GET /api/admin/jobs/:id ──────────────────────────────────────────────────

export async function handleJobDetail(req: Request, jobId: string): Promise<Response> {
  const job = getSyncJob(jobId);
  if (!job) return json({ error: "Job not found" }, 404);

  const diffLog = getDiffLog(jobId);
  return json({ job, diff_log: diffLog });
}

// ─── GET /api/admin/status ────────────────────────────────────────────────────

export async function handleAdminStatus(_req: Request): Promise<Response> {
  const stats = getStats();
  const jobs = getRecentJobs(5);
  return json({
    db_stats: stats,
    recent_jobs: jobs,
    active_syncs: Array.from(runningJobs),
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
