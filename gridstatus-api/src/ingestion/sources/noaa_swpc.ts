import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// NOAA SWPC geomagnetic / planetary K-index — grid impact risk
const K_INDEX_URL = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

// Response is array-of-arrays: [["time_tag","Kp","a_running","station_count"], ["2026-03-08 00:00:00.000","4.67",...], ...]
export async function fetchNoaaSwpc(): Promise<NormalizedRecord[]> {
  const res = await fetch(K_INDEX_URL, { headers: { "User-Agent": "GridStatus-API/0.1" } });
  if (!res.ok) throw new Error(`NOAA SWPC ${res.status}`);
  const raw = await res.json();
  const rows = Array.isArray(raw) ? raw : [];
  if (rows.length < 2) return [];
  const header = rows[0] as string[];
  const timeIdx = header.indexOf("time_tag");
  const kpIdx = header.indexOf("Kp") >= 0 ? header.indexOf("Kp") : 1;
  const records: NormalizedRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as (string | number)[];
    const timeRaw = timeIdx >= 0 ? row[timeIdx] : row[0];
    const kRaw = kpIdx >= 0 ? row[kpIdx] : row[1];
    const time = timeRaw != null ? String(timeRaw) : null;
    const k = typeof kRaw === "number" ? kRaw : parseFloat(String(kRaw ?? "")) || null;
    const title = `Planetary K-index ${k ?? "—"} at ${normalizeDate(time) ?? "—"}`;
    const normalized = {
      title,
      summary: "",
      region: "global",
      reading_type: "geomagnetic",
      value: k,
      unit: "Kp",
      observed_at: normalizeDate(time),
      source_url: "https://www.swpc.noaa.gov/products-and-data",
      raw_json: JSON.stringify(row),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "noaa_swpc",
      source_id: `${time ?? "unknown"}-${i}`,
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
