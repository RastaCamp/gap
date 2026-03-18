import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// USGS Water Services (water quality / streamflow) — https://waterservices.usgs.gov/nwis/iv/
const USGS_IV_URL = "https://waterservices.usgs.gov/nwis/iv/?format=json&parameterCd=00060,00065&sites=01646500,02037500&siteStatus=all";

export async function fetchUsgsWater(): Promise<NormalizedRecord[]> {
  const res = await fetch(USGS_IV_URL, { headers: { "User-Agent": "MyAir-API/0.1" } });
  if (!res.ok) throw new Error(`USGS Water ${res.status}`);
  const data = await res.json();
  const payload = data?.value ?? data;
  const timeSeries = payload?.timeSeries ?? [];
  const records: NormalizedRecord[] = [];

  for (const ts of timeSeries) {
    const sourceInfo = ts?.sourceInfo ?? {};
    const siteName = sourceInfo?.siteName ?? "Unknown";
    const siteCode = sourceInfo?.siteCode?.[0]?.value ?? "";
    const variable = ts?.variable ?? {};
    const varName = variable?.variableName ?? "";
    const values = ts?.values?.[0]?.value ?? [];
    const latest = values[values.length - 1];
    const dateTime = latest?.dateTime ?? null;
    const numVal = latest?.value != null ? parseFloat(String(latest.value)) : null;
    const unit = variable?.unit?.unitCode ?? null;

    const title = `${cleanText(siteName)} — ${cleanText(varName)} ${numVal ?? "—"} ${unit ?? ""}`;
    const geo = sourceInfo?.geoLocation?.geogLocation;
    const lat = geo?.latitude != null ? parseFloat(geo.latitude) : null;
    const lon = geo?.longitude != null ? parseFloat(geo.longitude) : null;

    const normalized = {
      title,
      summary: cleanText(varName),
      location_name: cleanText(siteName) || null,
      location_zip: null,
      latitude: lat,
      longitude: lon,
      value: numVal,
      unit: unit || null,
      category: "water_quality",
      observed_at: normalizeDate(dateTime),
      source_url: "https://waterservices.usgs.gov/",
      raw_json: JSON.stringify(ts),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "usgs_water",
      source_id: `${siteCode}-${variable?.variableCode?.[0]?.value ?? "iv"}-${dateTime ?? ""}`,
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
