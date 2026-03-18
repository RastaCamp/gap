import type { UnifiedRecord } from "../unified";

const AQI_BUCKETS: [number, number, string][] = [
  [50, 1, "good"],
  [100, 3, "moderate"],
  [150, 5, "unhealthy_sensitive"],
  [200, 7, "unhealthy"],
  [300, 9, "very_unhealthy"],
  [9999, 10, "hazardous"],
];

function aqiToSeverity(aqi: number | null): [number | null, string | null] {
  if (aqi == null) return [null, null];
  for (const [maxAqi, sev, label] of AQI_BUCKETS) {
    if (aqi <= maxAqi) return [sev, label];
  }
  return [null, null];
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/**
 * Map one AirNow observation to UnifiedRecord.
 * Use for risk_score, geo search, cross-source dashboards.
 */
export function mapAirnowToUnified(raw: Record<string, unknown>): UnifiedRecord {
  const aqi = num(raw.AQI ?? raw.aqi) ?? null;
  const [severity, bucket] = aqiToSeverity(aqi);

  const lat = num(raw.Latitude ?? raw.latitude);
  const lng = num(raw.Longitude ?? raw.longitude);
  const parameter = String(raw.ParameterName ?? raw.parameterName ?? "AQI");
  const reportingArea = String(raw.ReportingArea ?? raw.reportingArea ?? "");
  const state = raw.StateCode != null ? String(raw.StateCode) : (raw.stateCode != null ? String(raw.stateCode) : undefined);
  const dateObs = raw.DateObserved != null ? String(raw.DateObserved) : "";
  const hourObs = raw.HourObserved != null ? String(raw.HourObserved) : "0";
  const eventTime = dateObs && hourObs !== undefined
    ? `${dateObs}T${hourObs.padStart(2, "0")}:00:00`
    : undefined;

  const title = reportingArea ? `${parameter} in ${reportingArea}` : parameter;
  const summary = aqi != null && bucket ? `AQI ${aqi} (${bucket})` : "Air quality observation";
  const tags = ["air", "aqi", parameter.toLowerCase(), ...(bucket ? [bucket] : [])];

  const sourceId = [reportingArea, state, parameter, dateObs, hourObs].filter(Boolean).join(":");

  return {
    source: "airnow",
    source_id: sourceId,
    category: "environment",
    subcategory: "air_quality",
    title,
    summary,
    lat: lat ?? undefined,
    lng: lng ?? undefined,
    city: reportingArea || undefined,
    state: state ?? undefined,
    event_time: eventTime ?? undefined,
    severity: severity ?? undefined,
    tags,
    raw,
  };
}
