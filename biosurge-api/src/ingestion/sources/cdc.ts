import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// CDC/health data — use WHO GHO OData API (registry: ghoapi.azureedge.net) for outbreak-related indicators
// CDC Data Portal (data.cdc.gov) uses Socrata; use dataset-specific resource IDs per https://data.cdc.gov/
const WHO_GHO_INDICATORS = "https://ghoapi.azureedge.net/api/Indicator?$top=100";

export async function fetchCdc(): Promise<NormalizedRecord[]> {
  const res = await fetch(WHO_GHO_INDICATORS, { headers: { "User-Agent": "BioSurge-API/0.1" } });
  if (!res.ok) throw new Error(`CDC/WHO GHO ${res.status}`);
  const data = await res.json();
  const items = data?.value ?? [];
  const records: NormalizedRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const r = items[i] as Record<string, unknown>;
    const code = String(r?.IndicatorCode ?? "");
    const name = cleanText(String(r?.IndicatorName ?? ""));
    const title = name || code || "Health indicator";
    const normalized = {
      title,
      summary: name,
      report_type: "indicator",
      location: null,
      reported_at: normalizeDate(new Date().toISOString()),
      source_url: "https://ghoapi.azureedge.net/api",
      raw_json: JSON.stringify(r),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "cdc",
      source_id: code || `who-gho-${i}`,
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
