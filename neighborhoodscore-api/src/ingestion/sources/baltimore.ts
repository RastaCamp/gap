import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// Baltimore Open Data — migrated to ArcGIS Hub. Try Hub API for public datasets.
// Registry: https://data.baltimorecity.gov/ — many legacy Socrata endpoints now redirect to Hub.
const BALTIMORE_HUB = "https://services.arcgis.com/njFNhDsUCentVYJW/arcgis/rest/services/311_Customer_Service_Requests/FeatureServer/0/query?where=1%3D1&outFields=*&resultRecordCount=5&f=json";

export async function fetchBaltimore(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(BALTIMORE_HUB, { headers: { "User-Agent": "NeighborhoodScore-API/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    const features = data?.features ?? [];
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < features.length; i++) {
      const f = features[i] as { attributes?: Record<string, unknown> };
      const attrs = f?.attributes ?? {};
      const title = cleanText(String(attrs?.description ?? attrs?.requesttype ?? attrs?.srnumber ?? "Baltimore 311")) || "Baltimore report";
      const normalized = {
        title,
        summary: cleanText(String(attrs?.details ?? attrs?.description ?? "")),
        report_type: cleanText(String(attrs?.requesttype ?? "311")) || null,
        location_name: cleanText(String(attrs?.address ?? attrs?.location ?? "")) || null,
        location_zip: attrs?.zipcode != null ? String(attrs.zipcode) : null,
        state: "MD",
        value: null,
        reported_at: normalizeDate(attrs?.createddate ?? attrs?.requestdate),
        source_url: "https://data.baltimorecity.gov/",
        raw_json: JSON.stringify(f),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "baltimore",
        source_id: String(attrs?.objectid ?? attrs?.srnumber ?? `balt-${i}`),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
