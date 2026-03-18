import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// USGS Water Services — https://waterservices.usgs.gov/nwis/iv/ (instantaneous values)
// Legacy API; for new work see WDFN OGC API per registry.
const USGS_IV_URL = "https://waterservices.usgs.gov/nwis/iv/?format=json&parameterCd=00060,00065&sites=01646500,02037500,07141220&siteStatus=all";

function getStateCd(siteProperty: Array<{ value?: string; name?: string }> | undefined): string | null {
  if (!Array.isArray(siteProperty)) return null;
  const state = siteProperty.find((p) => p?.name === "stateCd");
  return state?.value ?? null;
}

export async function fetchUsgsWater(): Promise<NormalizedRecord[]> {
  const res = await fetch(USGS_IV_URL, { headers: { "User-Agent": "WaterSafe-API/0.1" } });
  if (!res.ok) throw new Error(`USGS Water ${res.status}`);
  const data = await res.json();
  const payload = data?.value ?? data;
  const timeSeries = payload?.timeSeries ?? [];
  const records: NormalizedRecord[] = [];

  for (const ts of timeSeries) {
    const sourceInfo = ts?.sourceInfo ?? {};
    const siteName = sourceInfo?.siteName ?? "Unknown site";
    const siteCode = sourceInfo?.siteCode?.[0]?.value ?? ts?.name ?? "";
    const stateCd = getStateCd(sourceInfo?.siteProperty);
    const variable = ts?.variable ?? {};
    const varName = variable?.variableName ?? variable?.variableDescription ?? "Water data";
    const values = ts?.values?.[0]?.value ?? [];
    const latest = values[values.length - 1];
    const dateTime = latest?.dateTime ?? null;
    const value = latest?.value != null ? parseFloat(String(latest.value)) : null;

    const title = `${cleanText(siteName)} — ${cleanText(varName)} ${value ?? "—"}`;
    const normalized = {
      title,
      summary: cleanText(varName),
      system_name: cleanText(siteName) || null,
      system_id: siteCode || null,
      location_zip: null,
      state: stateCd || null,
      compliance: null,
      reported_at: normalizeDate(dateTime),
      source_url: "https://waterservices.usgs.gov/",
      raw_json: JSON.stringify(ts),
    };
    const hash = await contentHash(normalized);
    const sourceId = `${siteCode}-${variable?.variableCode?.[0]?.value ?? "iv"}-${dateTime ?? ""}`;
    records.push({
      source: "usgs_water",
      source_id: sourceId,
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
