import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// U.S. EIA v2 — https://api.eia.gov/v2/electricity/rto/region-data/data/
// API key required: EIA_API_KEY. See https://www.eia.gov/opendata/
const EIA_BASE = "https://api.eia.gov/v2/electricity/rto/region-data/data";

export async function fetchEia(): Promise<NormalizedRecord[]> {
  const apiKey = process.env.EIA_API_KEY;
  if (!apiKey) return [];
  // EIA v2: frequency=hourly, data[]=value,dataSource,respondent,type,period,value
  const url = `${EIA_BASE}?api_key=${apiKey}&frequency=hourly&data[0]=value&data[1]=respondent&data[2]=type&length=500`;
  const res = await fetch(url, { headers: { "User-Agent": "GridStatus-API/0.1", "Accept": "application/json" } });
  if (!res.ok) throw new Error(`EIA ${res.status}`);
  const data = await res.json();
  const items = data?.response?.data ?? [];
  const records: NormalizedRecord[] = [];

  for (let i = 0; i < items.length; i++) {
    const r = items[i] as Record<string, unknown>;
    const period = r?.period ?? r?.datetime ?? r?.time;
    const value = typeof r?.value === "number" ? r.value : parseFloat(String(r?.value ?? ""));
    const respondent = cleanText(String(r?.respondent ?? r?.region ?? ""));
    const typeStr = cleanText(String(r?.type ?? "demand"));
    const title = `${respondent || "RTO"} ${typeStr} ${Number.isFinite(value) ? value : "—"} at ${normalizeDate(period) ?? "—"}`;
    const normalized = {
      title,
      summary: "",
      region: respondent || null,
      reading_type: typeStr || "demand",
      value: Number.isFinite(value) ? value : null,
      unit: "MW",
      observed_at: normalizeDate(period),
      source_url: "https://www.eia.gov/opendata/",
      raw_json: JSON.stringify(r),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "eia",
      source_id: `${r?.respondent ?? "rto"}-${r?.type ?? "demand"}-${period ?? i}-${r?.value ?? ""}`,
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
