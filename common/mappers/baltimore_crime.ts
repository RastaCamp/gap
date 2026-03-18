import type { UnifiedRecord } from "../unified";

const VIOLENT_TYPES = new Set([
  "HOMICIDE",
  "SHOOTING",
  "ROBBERY",
  "AGGRAVATED ASSAULT",
  "RAPE",
]);

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

function crimeTypeToSeverity(crimeType: string | null | undefined): number {
  if (!crimeType) return 3;
  const c = crimeType.toUpperCase();
  if (VIOLENT_TYPES.has(c)) return 8;
  if (c.includes("BURGLARY") || c.includes("AUTO THEFT")) return 5;
  return 3;
}

/**
 * Map one Open Baltimore crime incident to UnifiedRecord.
 * Use for risk_score, geo search, cross-source dashboards.
 */
export function mapOpenBaltimoreCrimeToUnified(raw: Record<string, unknown>): UnifiedRecord {
  const crimeType = (raw.crime_type ?? raw.description ?? "Crime incident") as string;
  const lat = num(raw.latitude ?? raw.Latitude);
  const lng = num(raw.longitude ?? raw.Longitude);

  const sourceId = String(raw.id ?? raw.cc_number ?? raw.CC_number ?? "");

  return {
    source: "open_baltimore",
    source_id: sourceId,
    category: "crime",
    subcategory: "incident",
    title: crimeType,
    summary: String(raw.description ?? raw.Description ?? ""),
    lat: lat ?? undefined,
    lng: lng ?? undefined,
    city: "Baltimore",
    state: "MD",
    event_time: raw.incident_time != null ? String(raw.incident_time) : undefined,
    severity: crimeTypeToSeverity(crimeType),
    tags: ["crime", crimeType.toLowerCase().replace(/\s+/g, "_")],
    raw,
  };
}
