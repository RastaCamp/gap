import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// USDA APHIS — https://www.aphis.usda.gov/ (animal/plant health).
// Open data via Data.gov catalog (CKAN API). Try one public dataset.
const DATA_GOV_APHIS = "https://catalog.data.gov/api/3/action/package_search?q=APHIS&rows=5";

export async function fetchAphis(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(DATA_GOV_APHIS, { headers: { "User-Agent": "BioSurge-API/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data?.result?.results ?? [];
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i] as Record<string, unknown>;
      const title = cleanText(String(r?.title ?? "APHIS dataset"));
      const summary = cleanText(String(r?.notes ?? r?.organization?.title ?? ""));
      const normalized = {
        title,
        summary,
        report_type: "dataset",
        location: null,
        reported_at: normalizeDate(r?.metadata_created ?? r?.metadata_modified),
        source_url: Array.isArray(r?.resources)?.[0]?.url ?? String(r?.url ?? "https://www.aphis.usda.gov/"),
        raw_json: JSON.stringify(r),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "aphis",
        source_id: String(r?.id ?? r?.name ?? `aphis-${i}`),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
