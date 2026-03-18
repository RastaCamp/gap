import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// CDC PLACES — https://www.cdc.gov/places/ (place-level health data). Data via data.cdc.gov Socrata.
const CDC_PLACES_URL = "https://data.cdc.gov/resource/cwsq-ngmh.json?$limit=50";

export async function fetchCdcPlaces(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(CDC_PLACES_URL, { headers: { "User-Agent": "NeighborhoodScore-API/0.1", "Accept": "application/json" } });
    if (!res.ok) return [];
    const items = await res.json();
    if (!Array.isArray(items)) return [];
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < items.length; i++) {
      const r = items[i] as Record<string, unknown>;
      const location = cleanText(String(r?.locationname ?? r?.place ?? r?.county ?? ""));
      const measure = cleanText(String(r?.measure ?? r?.short_question_text ?? ""));
      const title = location ? `${location} — ${measure}` : measure || "CDC PLACES";
      const dataValue = r?.data_value != null ? parseFloat(String(r.data_value)) : null;
      const normalized = {
        title,
        summary: measure,
        report_type: cleanText(String(r?.measureid ?? r?.category ?? "places")) || null,
        location_name: location || null,
        location_zip: r?.locationid != null ? String(r.locationid) : null,
        state: cleanText(String(r?.stateabbr ?? r?.state ?? "")) || null,
        value: Number.isFinite(dataValue) ? dataValue : null,
        reported_at: normalizeDate(r?.year ?? r?.date),
        source_url: "https://www.cdc.gov/places/",
        raw_json: JSON.stringify(r),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "cdc_places",
        source_id: `${r?.stateabbr ?? ""}-${r?.locationname ?? ""}-${r?.measureid ?? i}`.replace(/\s+/g, "_").slice(0, 150),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
