import type { UnifiedRecord } from "../unified";

function int(v: unknown): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Map one EPA Envirofacts / SDWIS row to UnifiedRecord.
 * Use for risk_score, geo search, cross-source dashboards.
 */
export function mapEnvirofactsWaterToUnified(raw: Record<string, unknown>): UnifiedRecord {
  const pwsName =
    (raw.PWS_NAME ?? raw.WATER_SYSTEM_NAME ?? raw.pws_name ?? "Water system") as string;
  const state = (raw.STATE_CODE ?? raw.state_code) != null ? String(raw.STATE_CODE ?? raw.state_code) : undefined;
  const zipCode = (raw.ZIP_CODE ?? raw.zip_code) != null ? String(raw.ZIP_CODE ?? raw.zip_code) : undefined;

  const violationCount = int(raw.VIOLATIONS ?? raw.VIOLATION_COUNT ?? raw.violations);
  const severity = Math.min(10, 2 + violationCount);

  const sourceId = String(raw.PWSID ?? raw.PWS_ID ?? raw.pwsid ?? pwsName);

  return {
    source: "envirofacts",
    source_id: sourceId,
    category: "water",
    subcategory: "drinking_water",
    title: pwsName,
    summary: `Water system record, violations=${violationCount}`,
    zip_code: zipCode ?? undefined,
    state: state ?? undefined,
    severity,
    tags: ["water", "epa", "sdwis"],
    raw,
  };
}
