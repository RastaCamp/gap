import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// EPA AirNow — https://docs.airnowapi.org/
// Requires API key (free). Set AIRNOW_API_KEY in env.

const AIRNOW_BASE = "https://airnowapi.org/air/obs/current/";

export async function fetchAirnow(): Promise<NormalizedRecord[]> {
  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) {
    console.warn("[airnow] AIRNOW_API_KEY not set — skipping or use zipCode for demo");
    return [];
  }
  // Example: current observations by ZIP (you can add bbox or other params per docs)
  const zipCode = process.env.AIRNOW_ZIP ?? "20002";
  const url = `${AIRNOW_BASE}zipCode?zipCode=${zipCode}&API_KEY=${apiKey}&format=application/json`;
  const res = await fetch(url, { headers: { "User-Agent": "MyAir-API/0.1" } });
  if (!res.ok) throw new Error(`AirNow ${res.status}`);
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : [raw];
  const records: NormalizedRecord[] = [];

  for (const r of list) {
    const name = cleanText(r?.ReportingArea ?? r?.ParameterName ?? "Unknown");
    const title = `${name} – AQI ${r?.AQI ?? r?.Value ?? "—"} (${r?.ParameterName ?? "air quality"})`;
    const normalized = {
      title,
      summary: cleanText(r?.Category?.Name ?? r?.Discussion ?? ""),
      location_name: name,
      location_zip: r?.ZipCode ?? zipCode ?? null,
      latitude: typeof r?.Latitude === "number" ? r.Latitude : parseFloat(r?.Latitude) || null,
      longitude: typeof r?.Longitude === "number" ? r.Longitude : parseFloat(r?.Longitude) || null,
      value: typeof r?.AQI === "number" ? r.AQI : parseFloat(r?.AQI ?? r?.Value) || null,
      unit: r?.Unit ?? "AQI",
      category: cleanText(r?.ParameterName ?? "air_quality").toLowerCase().replace(/\s+/g, "_"),
      observed_at: normalizeDate(r?.DateObserved ?? r?.DateTime ?? null),
      source_url: "https://docs.airnowapi.org/",
      raw_json: JSON.stringify(r),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "airnow",
      source_id: String(r?.UniqueId ?? r?.id ?? `${name}-${r?.ParameterName ?? "aqi"}-${Date.now()}`),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
