import { queryReadings, getStats } from "../db/client";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}

export async function handleReadings(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const p = url.searchParams;
  const params = {
    q: p.get("q") ?? undefined,
    source: p.get("source") ?? undefined,
    reading_type: p.get("reading_type") ?? undefined,
    region: p.get("region") ?? undefined,
    page: parseInt(p.get("page") ?? "1"),
    per_page: parseInt(p.get("per_page") ?? "50"),
  };
  if (isNaN(params.page) || params.page < 1) params.page = 1;
  if (isNaN(params.per_page)) params.per_page = 50;
  const { rows, total, source_counts } = queryReadings(params);
  return json({ data: rows, meta: { total, page: params.page, per_page: params.per_page, source_counts } });
}

export async function handleStats(_req: Request): Promise<Response> {
  return json(getStats());
}
