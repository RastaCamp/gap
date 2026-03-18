import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// NOAA Weather Alerts — https://api.weather.gov/alerts/active (no API key)
const NOAA_ALERTS_URL = "https://api.weather.gov/alerts/active";

export async function fetchNoaaAlerts(): Promise<NormalizedRecord[]> {
  const res = await fetch(NOAA_ALERTS_URL, {
    headers: { "User-Agent": "NewsSignal-API/0.1", "Accept": "application/geo+json, application/json" },
  });
  if (!res.ok) throw new Error(`NOAA Alerts ${res.status}`);
  const geojson = await res.json();
  const features = geojson?.features ?? [];
  const records: NormalizedRecord[] = [];

  for (const f of features) {
    const props = f?.properties ?? {};
    const id = props.id ?? props.identifier ?? f?.id ?? `noaa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const title = cleanText(props.headline ?? props.event ?? props.areaDesc ?? "Alert");
    const summary = cleanText(props.description ?? props.instruction ?? "");
    const effective = normalizeDate(props.effective ?? props.sent);
    const expires = normalizeDate(props.expires ?? props.onset);
    const normalized = {
      title,
      summary,
      alert_type: cleanText(props.event ?? props.messageType ?? null) || null,
      severity: cleanText(props.severity ?? null) || null,
      region: cleanText(props.areaDesc ?? props.senderName ?? null) || null,
      effective_at: effective,
      expires_at: expires,
      source_url: props.uri ?? "https://www.weather.gov/",
      raw_json: JSON.stringify(f),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "noaa_alerts",
      source_id: String(id),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
