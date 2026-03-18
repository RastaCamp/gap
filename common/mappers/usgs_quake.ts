import type { UnifiedRecord } from "../unified";

function quakeMagToSeverity(mag: number | null): number | null {
  if (mag == null) return null;
  if (mag < 2.5) return 2;
  if (mag < 4.0) return 4;
  if (mag < 5.5) return 6;
  if (mag < 7.0) return 8;
  return 10;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/**
 * Map one USGS GeoJSON feature to UnifiedRecord.
 * Use for risk_score, geo search, cross-source dashboards.
 */
export function mapUsgsFeatureToUnified(feature: Record<string, unknown>): UnifiedRecord {
  const props = (feature.properties as Record<string, unknown>) ?? {};
  const geom = (feature.geometry as Record<string, unknown>) ?? {};
  const coords = (geom.coordinates as unknown[]) ?? [];
  const lng = coords.length > 0 ? num(coords[0]) : null;
  const lat = coords.length > 1 ? num(coords[1]) : null;
  const depth = coords.length > 2 ? num(coords[2]) : null;

  const mag = num(props.mag);
  const time = props.time != null ? Number(props.time) : null;
  const eventTime =
    time != null && Number.isFinite(time)
      ? new Date(time).toISOString()
      : undefined;

  const id = feature.id != null ? String(feature.id) : (props.code != null ? String(props.code) : "");
  const title = (props.title ?? props.place ?? "Earthquake event") as string;
  const summary =
    mag != null
      ? `Magnitude ${mag}${depth != null ? `, depth ${depth} km` : ""}`
      : "Earthquake event";

  return {
    source: "usgs",
    source_id: id,
    category: "geophysical",
    subcategory: "earthquake",
    title: String(title),
    summary,
    lat: lat ?? undefined,
    lng: lng ?? undefined,
    event_time: eventTime ?? undefined,
    severity: quakeMagToSeverity(mag) ?? undefined,
    tags: ["earthquake", "usgs"],
    link: props.url != null ? String(props.url) : undefined,
    raw: feature as Record<string, unknown>,
  };
}
