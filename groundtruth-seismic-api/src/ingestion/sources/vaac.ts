import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// Volcanic Ash Advisory Centers — https://www.icao.int/safety/meteorology/Pages/VAAC.aspx
// No standard JSON API in registry; try NOAA volcanic activity RSS or similar public feed.
const NOAA_VOLCANO_RSS = "https://www.weather.gov/rss/volcano.rss";

function parseRssItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string; guid: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string; guid: string }> = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
    const link = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() ?? "";
    const pubDate = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? "";
    const description = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ?? "";
    const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ?? link || `vaac-${pubDate}-${title.slice(0, 30)}`;
    items.push({ title, link, pubDate, description, guid });
  }
  return items;
}

export async function fetchVaac(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(NOAA_VOLCANO_RSS, { headers: { "User-Agent": "GroundTruth-Seismic/0.1", "Accept": "application/rss+xml, application/xml" } });
    if (!res.ok) return [];
    const xml = await res.text();
    if (!xml.includes("<item")) return [];
    const items = parseRssItems(xml);
    const records: NormalizedRecord[] = [];

    for (const item of items) {
      const title = cleanText(item.title) || "Volcanic activity";
      const normalized = {
        title,
        summary: cleanText(item.description),
        event_type: "volcanic_ash",
        magnitude: null,
        latitude: null,
        longitude: null,
        depth_km: null,
        occurred_at: normalizeDate(item.pubDate),
        source_url: item.link || "https://www.icao.int/safety/meteorology/Pages/VAAC.aspx",
        raw_json: JSON.stringify(item),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "vaac",
        source_id: item.guid.replace(/^https?:\/\//i, "").slice(0, 200),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
