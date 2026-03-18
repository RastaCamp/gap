import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// N2YO — https://www.n2yo.com/api/ (satellite passes, TLE, etc.). API key required.
const N2YO_BASE = "https://api.n2yo.com/rest/v1/satellite";

export async function fetchN2yo(): Promise<NormalizedRecord[]> {
  const apiKey = process.env.N2YO_API_KEY;
  if (!apiKey) return [];
  const lat = process.env.N2YO_LAT ?? "40.0";
  const lon = process.env.N2YO_LON ?? "-75.0";
  const alt = process.env.N2YO_ALT ?? "0";
  const noradId = process.env.N2YO_SAT_ID ?? "25544"; // ISS
  try {
    const url = `${N2YO_BASE}/positions/${noradId}/${lat}/${lon}/${alt}/1/?apiKey=${apiKey}`;
    const res = await fetch(url, { headers: { "User-Agent": "SkyWatch-API/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    const positions = data?.positions ?? [];
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < positions.length; i++) {
      const p = positions[i] as Record<string, unknown>;
      const timestamp = p?.timestamp ?? p?.time;
      const title = `Satellite ${noradId} — azimuth ${p?.azimuth ?? "—"} elev ${p?.elevation ?? "—"}`;
      const normalized = {
        title,
        summary: "",
        observation_type: "satellite",
        value: typeof p?.elevation === "number" ? p.elevation : parseFloat(String(p?.elevation ?? "")) || null,
        unit: "deg",
        observed_at: normalizeDate(timestamp),
        source_url: "https://www.n2yo.com/api/",
        raw_json: JSON.stringify(p),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "n2yo",
        source_id: `${noradId}-${timestamp ?? i}`,
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
