import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// USGS Earthquake Hazards — https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson

const USGS_ALL_HOUR = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

export async function fetchUsgsEarthquake(): Promise<NormalizedRecord[]> {
  const res = await fetch(USGS_ALL_HOUR, { headers: { "User-Agent": "GroundTruth-Seismic/0.1" } });
  if (!res.ok) throw new Error(`USGS ${res.status}`);
  const geojson = await res.json();
  const features = geojson?.features ?? [];
  const records: NormalizedRecord[] = [];

  for (const f of features) {
    const props = f?.properties ?? {};
    const geom = f?.geometry;
    const coords = Array.isArray(geom?.coordinates) ? geom.coordinates : [];
    const mag = props.mag ?? props.magnitude ?? null;
    const title = props.title ?? `M${mag ?? "?"} ${props.place ?? "Unknown"}`;
    const summary = cleanText(props.detail ?? props.place ?? "");
    const occurred = normalizeDate(props.time ?? props.updated ?? null);
    const sourceId = f?.id ?? props.code ?? props.ids ?? `${props.time}-${props.place ?? "evt"}`;

    const normalized = {
      title,
      summary,
      event_type: "earthquake",
      magnitude: typeof mag === "number" ? mag : parseFloat(mag) || null,
      latitude: typeof coords[1] === "number" ? coords[1] : null,
      longitude: typeof coords[0] === "number" ? coords[0] : null,
      depth_km: typeof coords[2] === "number" ? coords[2] : null,
      occurred_at: occurred,
      source_url: props.url ?? "https://earthquake.usgs.gov/",
      raw_json: JSON.stringify(f),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "usgs_earthquake",
      source_id: String(sourceId),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
