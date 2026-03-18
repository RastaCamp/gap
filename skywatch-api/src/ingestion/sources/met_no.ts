import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// MET Norway Sunrise/Sun API — https://api.met.no/weatherapi/sunrise/3.0/
// Sun and moon data for a location/date (no API key).
const MET_SUN_BASE = "https://api.met.no/weatherapi/sunrise/3.0/sun";
const MET_MOON_BASE = "https://api.met.no/weatherapi/sunrise/3.0/moon";

export async function fetchMetNo(): Promise<NormalizedRecord[]> {
  const lat = process.env.MET_NO_LAT ?? "40.0";
  const lon = process.env.MET_NO_LON ?? "-75.0";
  const date = new Date().toISOString().slice(0, 10);
  const records: NormalizedRecord[] = [];

  try {
    const sunUrl = `${MET_SUN_BASE}?lat=${lat}&lon=${lon}&date=${date}`;
    const sunRes = await fetch(sunUrl, { headers: { "User-Agent": "SkyWatch-API/0.1 (contact@example.com)" } });
    if (sunRes.ok) {
      const sunData = await sunRes.json();
      const props = sunData?.properties ?? {};
      const sunrise = props?.sunrise?.time ?? null;
      const sunset = props?.sunset?.time ?? null;
      const title = `Sunrise ${normalizeDate(sunrise) ?? "—"} / Sunset ${normalizeDate(sunset) ?? "—"} (${date})`;
      const normalized = {
        title,
        summary: cleanText(sunData?.properties?.body ?? "Sun"),
        observation_type: "sun",
        value: null,
        unit: null,
        observed_at: normalizeDate(sunrise ?? date),
        source_url: "https://api.met.no/weatherapi/sunrise/3.0/",
        raw_json: JSON.stringify(sunData),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "met_no",
        source_id: `sun-${date}-${lat}-${lon}`,
        ...normalized,
        content_hash: hash,
      });
    }

    const moonUrl = `${MET_MOON_BASE}?lat=${lat}&lon=${lon}&date=${date}`;
    const moonRes = await fetch(moonUrl, { headers: { "User-Agent": "SkyWatch-API/0.1 (contact@example.com)" } });
    if (moonRes.ok) {
      const moonData = await moonRes.json();
      const props = moonData?.properties ?? {};
      const phase = props?.phase ?? props?.moonphase ?? null;
      const title = `Moon ${phase ?? "—"} (${date})`;
      const normalized = {
        title,
        summary: JSON.stringify(props).slice(0, 200),
        observation_type: "moon",
        value: null,
        unit: null,
        observed_at: normalizeDate(date),
        source_url: "https://api.met.no/weatherapi/sunrise/3.0/",
        raw_json: JSON.stringify(moonData),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "met_no",
        source_id: `moon-${date}-${lat}-${lon}`,
        ...normalized,
        content_hash: hash,
      });
    }
  } catch {
    // ignore
  }

  return records;
}
