import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// BirdCast — https://birdcast.info/api/ (migration radar data)
const BIRDCAST_API = "https://birdcast.info/api/v2/migration";

export async function fetchBirdcast(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(BIRDCAST_API, { headers: { "User-Agent": "BioSurge-API/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    const features = data?.features ?? data?.data ?? Array.isArray(data) ? data : [];
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < features.length; i++) {
      const f = features[i] as Record<string, unknown>;
      const props = f?.properties ?? f ?? {};
      const title = cleanText(String(props?.name ?? props?.title ?? props?.region ?? "Migration")) || "BirdCast migration";
      const normalized = {
        title,
        summary: cleanText(String(props?.description ?? props?.summary ?? "")),
        report_type: "migration",
        location: cleanText(String(props?.region ?? props?.location ?? "")) || null,
        reported_at: normalizeDate(props?.date ?? props?.datetime ?? props?.timestamp),
        source_url: "https://birdcast.info/api/",
        raw_json: JSON.stringify(f),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "birdcast",
        source_id: String(props?.id ?? props?.slug ?? `birdcast-${i}`),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
