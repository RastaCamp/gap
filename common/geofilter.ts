/**
 * Geo filtering: radius (Haversine), state, ZIP.
 * Store records with lat, lng, zip, state, county when available;
 * use PostGIS later if needed; for now Haversine is enough.
 */

export interface GeoRecord {
  lat?: number | null;
  lng?: number | null;
  zip?: string | null;
  zip_code?: string | null;
  state?: string | null;
  county?: string | null;
}

const R_KM = 6371.0;

function toRad(n: number): number {
  return (n * Math.PI) / 180;
}

/**
 * Distance in km between two points (Haversine).
 */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dlat = toRad(lat2 - lat1);
  const dlon = toRad(lon2 - lon1);
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_KM * c;
}

/**
 * Filter records to those within radius_km of (origin_lat, origin_lng).
 * Skips records without lat/lng.
 */
export function withinRadius<T extends GeoRecord>(
  records: T[],
  originLat: number,
  originLng: number,
  radiusKm: number
): T[] {
  return records.filter((r) => {
    if (r.lat == null || r.lng == null) return false;
    return haversineKm(originLat, originLng, r.lat, r.lng) <= radiusKm;
  });
}

/**
 * Filter by state code (case-insensitive).
 */
export function filterByState<T extends GeoRecord>(records: T[], state: string): T[] {
  const upper = state.toUpperCase();
  return records.filter((r) => (r.state ?? "").toUpperCase() === upper);
}

/**
 * Filter by exact ZIP.
 */
export function filterByZip<T extends GeoRecord>(records: T[], zip: string): T[] {
  const norm = zip.trim();
  return records.filter((r) => (r.zip ?? "").trim() === norm);
}
