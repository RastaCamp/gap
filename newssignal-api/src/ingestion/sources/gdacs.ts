import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

// GDACS RSS — https://www.gdacs.org/xml/rss.xml (disaster alerts)
const GDACS_RSS_URL = "https://www.gdacs.org/xml/rss.xml";

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
    const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i)?.[1]?.trim() ?? link || `gdacs-${pubDate}-${title.slice(0, 20)}`;
    items.push({ title, link, pubDate, description, guid });
  }
  return items;
}

export async function fetchGdacs(): Promise<NormalizedRecord[]> {
  const res = await fetch(GDACS_RSS_URL, {
    headers: { "User-Agent": "NewsSignal-API/0.1", "Accept": "application/rss+xml, application/xml, text/xml" },
  });
  if (!res.ok) throw new Error(`GDACS RSS ${res.status}`);
  const xml = await res.text();
  const items = parseRssItems(xml);
  const records: NormalizedRecord[] = [];

  for (const item of items) {
    const title = cleanText(item.title) || "GDACS Alert";
    const summary = cleanText(item.description);
    const normalized = {
      title,
      summary,
      alert_type: "disaster",
      severity: null,
      region: null,
      effective_at: normalizeDate(item.pubDate),
      expires_at: null,
      source_url: item.link || "https://www.gdacs.org/",
      raw_json: JSON.stringify(item),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "gdacs",
      source_id: item.guid.replace(/^https?:\/\//i, "").slice(0, 200),
      ...normalized,
      content_hash: hash,
    });
  }

  return records;
}
