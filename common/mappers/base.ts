import type { UnifiedRecord } from "../unified";

/**
 * Mapper contract: assign stable source/source_id, normalize location/time, assign severity/tags/category.
 * Raw is provider-specific (AirNow object, USGS feature, Envirofacts row, etc.).
 */
export interface Mapper<TRaw = Record<string, unknown>> {
  mapOne(raw: TRaw): UnifiedRecord;
  mapMany(rows: TRaw[]): UnifiedRecord[];
}

export function mapManyWith<TRaw>(mapOne: (raw: TRaw) => UnifiedRecord): Mapper<TRaw>["mapMany"] {
  return (rows: TRaw[]) => rows.map((row) => mapOne(row));
}
