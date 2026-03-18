import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

/**
 * NOAA Tsunami Warning Center — current tsunami events.
 * @see https://www.tsunami.gov/
 * Best endpoint: https://www.tsunami.gov/events/xml/PHEB_current.xml
 * No API key required.
 */

const TSUNAMI_XML = "https://www.tsunami.gov/events/xml/PHEB_current.xml";

function parseXmlEvents(xml: string): Array<{ id: string; title: string; summary: string; sent: string; link: string }> {
  const events: Array<{ id: string; title: string; summary: string; sent: string; link: string }> = [];
  // CAP-style: <event> or <entry> with <id>, <title>, <summary>, <updated>/<sent>, <link>
  const eventRegex = /<(?:event|entry)[^>]*>([\s\S]*?)<\/(?:event|entry)>/gi;
  let m: RegExpExecArray | null;
  while ((m = eventRegex.exec(xml)) !== null) {
    const block = m[1];
    const id = block.match(/<id[^>]*>([\s\S]*?)<\/id>/i)?.[1]?.replace(/<[^>]+>/g, "").trim()
      || block.match(/<identifier[^>]*>([\s\S]*?)<\/identifier>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim()
      || block.match(/<headline[^>]*>([\s\S]*?)<\/headline>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "Tsunami event";
    const summary = block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim()
      || block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() || "";
    const sent = block.match(/<sent[^>]*>([\s\S]*?)<\/sent>/i)?.[1]?.trim()
      || block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]?.trim()
      || block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]?.trim() || "";
    const link = block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1]
      || block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "https://www.tsunami.gov/";
    if (title || id) events.push({ id: id || `tsu-${sent}-${title.slice(0, 20)}`, title, summary, sent, link });
  }
  // Fallback: single <info> block (CAP)
  if (events.length === 0 && xml.includes("<info>")) {
    const infoBlock = xml.match(/<info>([\s\S]*?)<\/info>/i)?.[1] ?? "";
    const headline = infoBlock.match(/<headline[^>]*>([\s\S]*?)<\/headline>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "Tsunami bulletin";
    const description = infoBlock.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() || "";
    const sent = xml.match(/<sent[^>]*>([\s\S]*?)<\/sent>/i)?.[1]?.trim() || "";
    events.push({ id: `tsu-pheb-${Date.now()}`, title: headline, summary: description, sent, link: "https://www.tsunami.gov/" });
  }
  return events;
}

export async function fetchTsunami(): Promise<NormalizedRecord[]> {
  try {
    const res = await fetch(TSUNAMI_XML, { headers: { "User-Agent": "GroundTruth-Seismic/0.1", "Accept": "application/xml, text/xml" } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = parseXmlEvents(xml);
    const records: NormalizedRecord[] = [];

    for (const item of items) {
      const title = cleanText(item.title) || "Tsunami bulletin";
      const normalized = {
        title,
        summary: cleanText(item.summary),
        event_type: "tsunami",
        magnitude: null,
        latitude: null,
        longitude: null,
        depth_km: null,
        occurred_at: normalizeDate(item.sent),
        source_url: item.link,
        raw_json: JSON.stringify(item),
      };
      const hash = await contentHash(normalized);
      records.push({
        source: "tsunami",
        source_id: item.id.slice(0, 200),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
