import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// EPA AirNow — https://docs.airnowapi.org/ (API key required for observations by ZIP)
const AIRNOW_BASE = "https://airnowapi.org/air/obs/current/";

export async function fetchAirnow(): Promise<NormalizedRecord[]> {
  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) return [];
  const zipCode = process.env.AIRNOW_ZIP ?? "21202";
  const url = `${AIRNOW_BASE}zipCode?zipCode=${zipCode}&API_KEY=${apiKey}&format=application/json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "NeighborhoodScore-API/0.1" } });
    if (!res.ok) return [];
    const raw = await res.json();
    const list = Array.isArray(raw) ? raw : [raw];
    const records: NormalizedRecord[] = [];

    for (const r of list) {
      const name = cleanText((r as Record<string, unknown>)?.ReportingArea ?? (r as Record<string, unknown>)?.ParameterName ?? "Unknown");
      const aqi = (r as Record<string, unknown>)?.AQI ?? (r as Record<string, unknown>)?.Value;
      const value = typeof aqi === "number" ? aqi : parseFloat(String(aqi ?? ""));
      const title = `${name} – AQI ${Number.isFinite(value) ? value : "—"}`;
      const normalized = {
        title,
        summary: cleanText((r as Record<string, unknown>)?.Category?.Name ?? ""),
        report_type: "air_quality",
        location_name: name,
        location_zip: (r as Record<string, unknown>)?.ZipCode ?? zipCode ?? null,
        state: (r as Record<string, unknown>)?.StateCode ?? null,
        value: Number.isFinite(value) ? value : null,
        reported_at: normalizeDate((r as Record<string, unknown>)?.DateObserved ?? (r as Record<string, unknown>)?.DateTime),
        source_url: "https://docs.airnowapi.org/",
        raw_json: JSON.stringify(r),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "airnow",
        source_id: String((r as Record<string, unknown>)?.UniqueId ?? `${name}-${Date.now()}`),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
