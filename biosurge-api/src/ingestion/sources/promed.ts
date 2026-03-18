import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// ProMED-mail — https://promedmail.org/ (outbreak alerts). RSS/feed URL may vary; try common paths.
const PROMED_URLS = [
  "https://promedmail.org/feed/",
  "https://promedmail.org/rss.xml",
  "https://promedmail.org/rss",
];

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
    const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ?? (link || `promed-${pubDate}-${title.slice(0, 30)}`);
    items.push({ title, link, pubDate, description, guid });
  }
  return items;
}

export async function fetchPromed(): Promise<NormalizedRecord[]> {
  for (const url of PROMED_URLS) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "BioSurge-API/0.1", "Accept": "application/rss+xml, application/xml, text/xml" } });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml.includes("<item") && !xml.includes("<entry")) continue;
      const items = parseRssItems(xml);
      const records: NormalizedRecord[] = [];

      for (const item of items) {
        const title = cleanText(item.title) || "ProMED alert";
        const normalized = {
          title,
          summary: cleanText(item.description),
          report_type: "outbreak",
          location: null,
          reported_at: normalizeDate(item.pubDate),
          source_url: item.link || "https://promedmail.org/",
          raw_json: JSON.stringify(item),
        };
        const hash = await contentHash(normalized);
        records.push({
          source: "promed",
          source_id: item.guid.replace(/^https?:\/\//i, "").slice(0, 200),
          ...normalized,
          content_hash: hash,
        });
      }
      return records;
    } catch {
      continue;
    }
  }
  return [];
}
