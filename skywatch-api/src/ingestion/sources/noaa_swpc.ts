import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// NOAA Space Weather — xrays-7-day.json (solar flares)
const XRAYS_URL = "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json";

export async function fetchNoaaSwpc(): Promise<NormalizedRecord[]> {
  const res = await fetch(XRAYS_URL, { headers: { "User-Agent": "SkyWatch-API/0.1" } });
  if (!res.ok) throw new Error(`NOAA SWPC ${res.status}`);
  const raw = await res.json();
  const list = Array.isArray(raw) ? raw : (raw?.data ?? [raw]);
  const records: NormalizedRecord[] = [];

  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    const time = r?.time_tag ?? r?.timestamp ?? r?.time ?? null;
    const flux = r?.flux ?? r?.xray_flux ?? null;
    const title = `X-ray flux ${flux ?? "—"} at ${normalizeDate(time) ?? "—"}`;
    const normalized = {
      title,
      summary: cleanText(r?.observed_flux ?? r?.note ?? ""),
      observation_type: "solar_flare",
      value: typeof flux === "number" ? flux : parseFloat(flux) || null,
      unit: r?.unit ?? "W/m^2",
      observed_at: normalizeDate(time),
      source_url: "https://www.swpc.noaa.gov/products-and-data",
      raw_json: JSON.stringify(r),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "noaa_swpc",
      source_id: String(r?.time_tag ?? r?.timestamp ?? `${time}-${i}`),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
