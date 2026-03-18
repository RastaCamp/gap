import { queryRecalls, getStats } from "../db/client";

// ─── GET /api/recalls ─────────────────────────────────────────────────────────
// Query params:
//   q           - full text search
//   source      - fda | usda | cdc | foodsafety
//   status      - ongoing | completed | terminated | unknown
//   classification - "Class I" | "Class II" | "Class III"
//   page        - default 1
//   per_page    - default 50, max 200
//
// Returns:
//   { data: Recall[], meta: { total, page, per_page, source_counts } }

export async function handleRecalls(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const p = url.searchParams;

  const params = {
    q:              p.get("q") ?? undefined,
    source:         p.get("source") ?? undefined,
    status:         p.get("status") ?? undefined,
    classification: p.get("classification") ?? undefined,
    page:           parseInt(p.get("page") ?? "1"),
    per_page:       parseInt(p.get("per_page") ?? "50"),
  };

  if (isNaN(params.page) || params.page < 1) params.page = 1;
  if (isNaN(params.per_page)) params.per_page = 50;

  const { rows, total, source_counts } = queryRecalls(params);

  return json({
    data: rows,
    meta: {
      total,
      page: params.page,
      per_page: params.per_page,
      source_counts,
    },
  });
}

// ─── GET /api/stats ───────────────────────────────────────────────────────────

export async function handleStats(_req: Request): Promise<Response> {
  return json(getStats());
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
