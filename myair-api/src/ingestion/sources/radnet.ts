import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// EPA RadNet — https://www.epa.gov/radnet
// Endpoint: https://enviro.epa.gov/enviro/efservice/radnet_monitor/JSON

export async function fetchRadnet(): Promise<NormalizedRecord[]> {
  const url = "https://enviro.epa.gov/enviro/efservice/radnet_monitor/JSON";
  const res = await fetch(url, { headers: { "User-Agent": "MyAir-API/0.1 (public data)" } });
  if (!res.ok) throw new Error(`RadNet ${res.status}`);
  const raw = await res.json();
  const records: NormalizedRecord[] = [];
  const list = Array.isArray(raw) ? raw : [raw];

  for (const r of list) {
    const title = cleanText(r?.LocationName ?? r?.location ?? "Unknown location") + " – RadNet";
    const summary = cleanText(r?.Notes ?? r?.notes ?? "");
    const normalized = {
      title,
      summary,
      location_name: cleanText(r?.LocationName ?? r?.location ?? null) || null,
      location_zip: r?.ZIP ?? r?.zip ?? null,
      latitude: typeof r?.Latitude === "number" ? r.Latitude : parseFloat(r?.Latitude) || null,
      longitude: typeof r?.Longitude === "number" ? r.Longitude : parseFloat(r?.Longitude) || null,
      value: typeof r?.Value === "number" ? r.Value : parseFloat(r?.value ?? r?.Value) || null,
      unit: r?.Unit ?? r?.unit ?? null,
      category: "radiation",
      observed_at: normalizeDate(r?.SampleDate ?? r?.sample_date ?? r?.Date ?? null),
      source_url: "https://www.epa.gov/radnet",
      raw_json: JSON.stringify(r),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "radnet",
      source_id: String(r?.Id ?? r?.id ?? r?.LocationId ?? `${r?.LocationName ?? "unknown"}-${Date.now()}`),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
