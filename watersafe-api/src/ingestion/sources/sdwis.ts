import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText } from "../normalize";

/**
 * EPA Safe Drinking Water Information System (SDWIS) via EnviroFacts.
 * Option A (recommended): EnviroFacts Data Service API.
 * @see https://www.epa.gov/enviro/envirofacts-data-service-api
 * @see https://data.epa.gov/efservice/ (program.table pattern)
 *
 * ZIP query: optional env SDWIS_ZIPS (comma-separated, e.g. "21201,21202"); default "21201".
 * If EPA returns 404, the exact table name may have changed — check EPA metadata.
 */

const DATA_EPA_BASE = "https://data.epa.gov/efservice";
const ENVIRO_LEGACY_BASE = "https://enviro.epa.gov/enviro/efservice";

function getZips(): string[] {
  const zips = process.env.SDWIS_ZIPS ?? "21201";
  return zips.split(",").map((z) => z.trim()).filter(Boolean);
}

interface EnviroRow {
  PWSID?: string;
  PWS_NAME?: string;
  WATER_SYSTEM_NAME?: string;
  STATE_CODE?: string;
  ZIP_CODE?: string;
  [k: string]: unknown;
}

export async function fetchSdwis(): Promise<NormalizedRecord[]> {
  const zips = getZips();
  const records: NormalizedRecord[] = [];

  for (const zip of zips) {
    // Try new data.epa.gov API first (program.table + filter)
    // Table names may be sdwis.water_system_facility or similar; ZIP filter if supported
    const urlsToTry = [
      `${DATA_EPA_BASE}/sdwis.water_system_facility/zip_code/equals/${zip}/1:500/json`,
      `${DATA_EPA_BASE}/sdwis.water_system_facility/1:500/json`,
      `${ENVIRO_LEGACY_BASE}/SDWA_PWS/ZIP_CODE/${zip}/JSON`,
      `${ENVIRO_LEGACY_BASE}/WATER_SYSTEM_FACILITY/ZIP_CODE/${zip}/JSON`,
    ];

    let data: EnviroRow[] | null = null;
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "WaterSafe-API/0.1" } });
        if (!res.ok) continue;
        const json = await res.json();
        if (Array.isArray(json) && json.length >= 0) {
          data = json;
          break;
        }
        if (json && Array.isArray(json.rows)) {
          data = json.rows;
          break;
        }
        if (json && typeof json === "object" && !Array.isArray(json)) {
          data = [json];
          break;
        }
      } catch {
        continue;
      }
    }

    if (!data || data.length === 0) continue;

    for (let i = 0; i < data.length; i++) {
      const row = data[i] as EnviroRow;
      const pwsId = row.PWSID ?? row.pwsid ?? "";
      const name = cleanText(String(row.PWS_NAME ?? row.WATER_SYSTEM_NAME ?? (row as Record<string, unknown>).water_system_name ?? (row as Record<string, unknown>).pws_name ?? "SDWIS water system"));
      const state = cleanText(String(row.STATE_CODE ?? row.state_code ?? "")) || null;
      const zipCode = cleanText(String(row.ZIP_CODE ?? row.zip_code ?? zip)) || null;
      const title = name || `Water system ${pwsId || i}`;
      const normalized = {
        title,
        summary: "EPA SDWIS / EnviroFacts",
        system_name: name || null,
        system_id: pwsId || null,
        location_zip: zipCode,
        state,
        compliance: null,
        reported_at: null,
        source_url: "https://www.epa.gov/sdwis",
        raw_json: JSON.stringify(row),
      };
      const hash = await contentHash(normalized);
      const sourceId = `${pwsId || `zip-${zip}-${i}`}`.replace(/\s/g, "_");
      records.push({
        source: "sdwis",
        source_id: sourceId,
        ...normalized,
        content_hash: hash,
      });
    }
  }

  return records;
}
