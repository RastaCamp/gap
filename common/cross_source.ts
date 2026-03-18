/**
 * Cross-source merge and view: merged timelines, deduped alerts, geo-filtered.
 * Use after mappers + applyRiskScore; then optional geo filter.
 */
import type { UnifiedRecord } from "./unified";
import { withinRadius } from "./geofilter";

/**
 * Merge multiple source lists and sort by risk_score (desc), then severity (desc).
 */
export function mergeAndSort(recordsBySource: UnifiedRecord[][]): UnifiedRecord[] {
  const merged = recordsBySource.flat();
  merged.sort((a, b) => {
    const ra = a.risk_score ?? a.severity ?? 0;
    const rb = b.risk_score ?? b.severity ?? 0;
    if (rb !== ra) return rb - ra;
    const sa = a.severity ?? 0;
    const sb = b.severity ?? 0;
    return sb - sa;
  });
  return merged;
}

/**
 * Build cross-source view: merge, optionally filter by radius.
 * Pattern: raw by source -> mappers -> apply_risk_score -> build_cross_source_view -> response.
 */
export function buildCrossSourceView(
  recordsBySource: UnifiedRecord[][],
  opts?: {
    lat?: number | null;
    lng?: number | null;
    radius_km?: number | null;
  }
): UnifiedRecord[] {
  let merged = mergeAndSort(recordsBySource);

  if (
    opts?.lat != null &&
    opts?.lng != null &&
    opts?.radius_km != null &&
    opts.radius_km > 0
  ) {
    merged = withinRadius(merged, opts.lat, opts.lng, opts.radius_km);
  }

  return merged;
}
