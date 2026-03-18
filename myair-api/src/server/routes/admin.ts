import { getRecentJobs, getSyncJob, getDiffLog, getStats } from "../db/client";
import { runAllSources, runSingleSource } from "../../ingestion/worker";
import type { SourceName } from "../../shared/types";

const runningJobs = new Set<string>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

export async function handleSync(req: Request): Promise<Response> {
  const body = (await req.json().catch(() => ({}))) as { source?: string };
  const source = (body.source ?? "all") as SourceName | "all";
  const valid = ["all", "airnow", "radnet", "copernicus", "tri", "usgs_water"];
  if (!valid.includes(source)) return json({ error: `Invalid source. Use: ${valid.join(", ")}` }, 400);
  if (runningJobs.has(source)) return json({ error: `Sync already running: ${source}` }, 409);

  runningJobs.add(source);
  const jobPromise = source === "all" ? runAllSources() : runSingleSource(source as SourceName);
  jobPromise.then(() => runningJobs.delete(source)).catch(() => runningJobs.delete(source));
  await Bun.sleep(100);

  return json({ status: "started", message: `Sync started: ${source}`, source });
}

export async function handleJobs(_req: Request): Promise<Response> {
  return json({ data: getRecentJobs(30), meta: { count: getRecentJobs(30).length } });
}

export async function handleJobDetail(_req: Request, jobId: string): Promise<Response> {
  const job = getSyncJob(jobId);
  if (!job) return json({ error: "Job not found" }, 404);
  return json({ job, diff_log: getDiffLog(jobId) });
}

export async function handleAdminStatus(_req: Request): Promise<Response> {
  return json({
    db_stats: getStats(),
    recent_jobs: getRecentJobs(5),
    active_syncs: Array.from(runningJobs),
  });
}
