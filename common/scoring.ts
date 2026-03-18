/**
 * Rule-based environmental / safety risk scoring. Start with this; add ML later.
 * Inputs can come from UnifiedRecord or raw values.
 */
import type { UnifiedRecord } from "./unified";

export function clamp(value: number, low: number = 0, high: number = 100): number {
  return Math.max(low, Math.min(high, value));
}

/**
 * Combined environmental risk (e.g. for a location or dashboard).
 * Cap each factor so one signal doesn’t dominate.
 */
export function environmentalRiskScore(opts: {
  aqi?: number | null;
  radiation?: number | null;
  toxics?: number | null;
  water?: number | null;
}): number {
  let score = 0;
  if (opts.aqi != null) score += Math.min(opts.aqi / 3, 35);
  if (opts.radiation != null) score += Math.min(opts.radiation * 10, 25);
  if (opts.toxics != null) score += Math.min(opts.toxics * 5, 20);
  if (opts.water != null) score += Math.min(opts.water * 2, 20);
  return Math.round(clamp(score, 0, 100) * 10) / 10;
}

/**
 * Water-specific risk from violations / contaminants (e.g. SDWIS-style).
 */
export function waterRiskScore(violations: number = 0, contaminants: number = 0): number {
  const score = violations * 12 + contaminants * 5;
  return clamp(score, 0, 100);
}

/**
 * Crime / safety risk from incident counts (e.g. 30-day window).
 */
export function crimeRiskScore(incidents30d: number = 0, violent30d: number = 0): number {
  const score = incidents30d * 2 + violent30d * 6;
  return clamp(score, 0, 100);
}

/**
 * Cross-source: fill risk_score on a UnifiedRecord by category/subcategory.
 * Use after mappers; keeps routes generic.
 */
export function applyRiskScore(record: UnifiedRecord): UnifiedRecord {
  if (record.risk_score != null) return record;

  const cat = record.category ?? "";
  const sub = record.subcategory ?? "";
  const raw = record.raw ?? {};
  let risk = 0;

  if (cat === "environment" && sub === "air_quality") {
    const aqi = raw.AQI ?? raw.aqi;
    const n = typeof aqi === "number" ? aqi : parseInt(String(aqi), 10);
    risk = Number.isFinite(n) ? Math.min(100, n) : (record.severity ?? 0) * 10;
  } else if (cat === "geophysical" && sub === "earthquake") {
    const props = (raw.properties as Record<string, unknown>) ?? {};
    const mag = typeof props.mag === "number" ? props.mag : parseFloat(String(props.mag ?? ""));
    risk = Number.isFinite(mag) ? Math.min(100, mag * 12) : (record.severity ?? 0) * 10;
  } else if (cat === "crime") {
    risk = Math.min(100, (record.severity ?? 0) * 10);
  } else if (cat === "water") {
    const violations = raw.VIOLATIONS ?? raw.VIOLATION_COUNT ?? raw.violations ?? 0;
    const v = typeof violations === "number" ? violations : parseInt(String(violations), 10);
    risk = Math.min(100, 20 + (Number.isFinite(v) ? v : 0) * 10);
  } else {
    risk = Math.min(100, (record.severity ?? 0) * 10);
  }

  return { ...record, risk_score: clamp(risk, 0, 100) };
}

export function applyRiskScores(records: UnifiedRecord[]): UnifiedRecord[] {
  return records.map(applyRiskScore);
}
