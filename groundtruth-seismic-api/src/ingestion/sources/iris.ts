import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// IRIS FDSN Event Web Service — https://service.iris.edu/fdsnws/event/1/
// Query params: starttime, endtime, minmag, format=json (or geojson)
const IRIS_EVENT_URL = "https://service.iris.edu/fdsnws/event/1/query";

export async function fetchIris(): Promise<NormalizedRecord[]> {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const starttime = start.toISOString().slice(0, 10);
  const endtime = end.toISOString().slice(0, 10);
  const url = `${IRIS_EVENT_URL}?format=json&starttime=${starttime}&endtime=${endtime}&minmag=4&orderby=time-asc`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "GroundTruth-Seismic/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    const events = data?.events ?? data ?? [];
    const list = Array.isArray(events) ? events : [events];
    const records: NormalizedRecord[] = [];

    for (const ev of list) {
      const pref = (ev as Record<string, unknown>)?.preferred ?? ev;
      const desc = (ev as Record<string, unknown>)?.description ?? pref;
      const mag = (desc as Record<string, unknown>)?.magnitude ?? (pref as Record<string, unknown>)?.magnitude;
      const place = (desc as Record<string, unknown>)?.text ?? (pref as Record<string, unknown>)?.place ?? "";
      const time = (pref as Record<string, unknown>)?.time ?? (ev as Record<string, unknown>)?.time;
      const id = (ev as Record<string, unknown>)?.id ?? (pref as Record<string, unknown>)?.publicID ?? `${time}-${place}`;
      const lat = (pref as Record<string, unknown>)?.latitude ?? (ev as Record<string, unknown>)?.latitude;
      const lon = (pref as Record<string, unknown>)?.longitude ?? (ev as Record<string, unknown>)?.longitude;
      const depth = (pref as Record<string, unknown>)?.depth ?? (ev as Record<string, unknown>)?.depth;

      const title = `M${mag ?? "?"} ${cleanText(String(place)) || "IRIS event"}`;
      const normalized = {
        title,
        summary: cleanText(String(place)),
        event_type: "earthquake",
        magnitude: typeof mag === "number" ? mag : parseFloat(String(mag)) || null,
        latitude: typeof lat === "number" ? lat : parseFloat(String(lat)) || null,
        longitude: typeof lon === "number" ? lon : parseFloat(String(lon)) || null,
        depth_km: typeof depth === "number" ? depth : parseFloat(String(depth)) || null,
        occurred_at: normalizeDate(time),
        source_url: "https://service.iris.edu/",
        raw_json: JSON.stringify(ev),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "iris",
        source_id: String(id),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
