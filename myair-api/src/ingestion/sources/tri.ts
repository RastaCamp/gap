import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText } from "../normalize";

// EPA TRI (Toxics Release Inventory) — EnviroFacts REST API
// https://www.epa.gov/toxics-release-inventory-tri-program | enviro.epa.gov/efservice
const TRI_BASE = "https://enviro.epa.gov/enviro/efservice/tri_facility/state_abbr";
const TRI_ROWS = "/rows/0/100/JSON";

export async function fetchTri(): Promise<NormalizedRecord[]> {
  const states = process.env.TRI_STATES ?? "VA,MD,DC";
  const stateList = states.split(",").map((s) => s.trim()).filter(Boolean);
  const records: NormalizedRecord[] = [];

  for (const state of stateList) {
    try {
      const url = `${TRI_BASE}/${state}${TRI_ROWS}`;
      const res = await fetch(url, { headers: { "User-Agent": "MyAir-API/0.1" } });
      if (!res.ok) continue;
      const raw = await res.json();
      const list = Array.isArray(raw) ? raw : [raw];
      for (const r of list) {
        const rec = r as Record<string, unknown>;
        const title = cleanText(String(rec?.facility_name ?? "TRI facility"));
        const summary = [rec?.city_name, rec?.state_abbr, rec?.zip_code].filter(Boolean).join(", ");
        const normalized = {
          title,
          summary: cleanText(summary),
          location_name: title,
          location_zip: rec?.zip_code != null ? String(rec.zip_code) : null,
          latitude: typeof rec?.fac_latitude === "number" && rec.fac_latitude !== 0 ? rec.fac_latitude / 10000 : null,
          longitude: typeof rec?.fac_longitude === "number" && rec.fac_longitude !== 0 ? rec.fac_longitude / 10000 : null,
          value: null,
          unit: null,
          category: "tri_facility",
          observed_at: null,
          source_url: "https://www.epa.gov/toxics-release-inventory-tri-program",
          raw_json: JSON.stringify(rec),
        };
        const hash = await contentHash(normalized);
        records.push({
          source: "tri",
          source_id: String(rec?.tri_facility_id ?? rec?.epa_registry_id ?? title + state),
          ...normalized,
          content_hash: hash,
        });
      }
    } catch {
      continue;
    }
  }

  return records;
}
