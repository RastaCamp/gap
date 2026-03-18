/**
 * Unified record schema for cross-project / cross-source use.
 * Use one mapper per provider (mapAirnowToUnified, mapUsgsQuakeToUnified, etc.)
 * so routes/services stay generic for risk_score, geo search, merged timelines, deduped alerts.
 */

export interface UnifiedRecord {
  source: string;
  source_id: string;
  category: string;
  subcategory?: string | null;

  title: string;
  summary: string;

  lat?: number | null;
  lng?: number | null;
  zip_code?: string | null;
  city?: string | null;
  county?: string | null;
  state?: string | null;
  country?: string | null;

  event_time?: string | null;
  updated_time?: string | null;

  severity?: number | null;
  risk_score?: number | null;
  confidence?: number | null;

  tags: string[];
  link?: string | null;

  raw?: Record<string, unknown>;
}

/** GeoRecord-compatible: records with lat/lng/zip/state for geofilter. */
export function toGeoShape(r: UnifiedRecord): { lat?: number | null; lng?: number | null; zip?: string | null; state?: string | null; county?: string | null } {
  return {
    lat: r.lat,
    lng: r.lng,
    zip: r.zip_code ?? undefined,
    state: r.state,
    county: r.county,
  };
}
