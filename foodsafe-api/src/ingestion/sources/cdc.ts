import type { NormalizedRecord } from "../../shared/types";
import { contentHash, normalizeDate, extractStates, cleanText } from "../normalize";

// ─── CDC Foodborne Outbreak Data ──────────────────────────────────────────────
// CDC provides multistate outbreak data via their public datasets.
// Primary: CDC's food safety outbreak data (NORS / FoodNet)
// Also pulling from the CDC recalls/alerts page via RSS

const CDC_OUTBREAKS_URL = "https://www.cdc.gov/foodsafety/outbreaks/multistate-outbreaks/outbreaks-list.html";
const CDC_RSS_URL       = "https://tools.cdc.gov/api/v2/resources/media/316422.rss";
const CDC_JSON_URL      = "https://www.cdc.gov/foodborne-outbreak-investigations/data.json";

// ─── Try CDC's open data JSON ─────────────────────────────────────────────────

interface CdcOutbreakRecord {
  year?: string | number;
  month?: string;
  multistate?: string;
  species?: string;
  serotype?: string;
  food?: string;
  restaurant?: string;
  setting?: string;
  illnesses?: number | string;
  hospitalizations?: number | string;
  deaths?: number | string;
  status?: string;
  cdc_report?: string;
  states?: string;
}

export async function fetchCdcJson(): Promise<CdcOutbreakRecord[]> {
  try {
    const res = await fetch(CDC_JSON_URL, {
      headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const records = Array.isArray(data) ? data : data?.outbreaks ?? data?.data ?? [];
    console.log(`[cdc] Fetched ${records.length} records from JSON`);
    return records;
  } catch (e) {
    console.warn("[cdc] JSON fetch failed:", e);
    return [];
  }
}

// ─── Fallback: CDC RSS feed ───────────────────────────────────────────────────

interface RssOutbreak {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  categories: string[];
}

export async function fetchCdcRss(): Promise<RssOutbreak[]> {
  try {
    const res = await fetch(CDC_RSS_URL, {
      headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    return items.map(([, inner], idx) => {
      const title       = inner.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? inner.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
      const description = (inner.match(/<description><!\[CDATA\[([\s\S]*?)\]\]>/)?.[1] ?? inner.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const link        = inner.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
      const pubDate     = inner.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
      const guid        = inner.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] ?? `cdc-rss-${idx}`;
      const categories  = [...inner.matchAll(/<category[^>]*>(.*?)<\/category>/g)].map(m => m[1]);

      return { id: guid, title, description, link, pubDate, categories };
    });
  } catch (e) {
    console.warn("[cdc] RSS fetch failed:", e);
    return [];
  }
}

// ─── Normalize CDC JSON outbreaks ─────────────────────────────────────────────

export async function normalizeCdcJson(raw: CdcOutbreakRecord[]): Promise<NormalizedRecord[]> {
  const results: NormalizedRecord[] = [];

  for (const r of raw) {
    const pathogen = [r.species, r.serotype].filter(Boolean).join(" ") || "Unknown pathogen";
    const food = cleanText(r.food) || "Unknown food";
    const title = `${pathogen} outbreak linked to ${food}`;
    const illCount = String(r.illnesses ?? "unknown");
    const reason = `${pathogen} contamination. ${illCount} illnesses reported. Food vehicle: ${food}.`;

    const normalized = {
      title,
      reason,
      classification: "Class I" as const, // CDC outbreaks are always serious
      status: r.status?.toLowerCase().includes("over") ? "completed" as const : "ongoing" as const,
      recalling_firm: cleanText(r.restaurant) || "Multiple establishments",
      product_description: food,
      product_quantity: null,
      distribution_pattern: cleanText(r.states) || null,
      recall_initiation_date: r.year && r.month ? `${r.year}-${String(r.month).padStart(2, "0")}-01` : null,
      termination_date: null,
      report_date: r.year ? `${r.year}-01-01` : null,
    };

    const hash = await contentHash(normalized);
    const sourceId = r.cdc_report || `cdc-${r.year}-${food.slice(0, 20).replace(/\s/g, "-")}`;

    results.push({
      source: "cdc",
      source_id: sourceId,
      ...normalized,
      source_url: r.cdc_report || "https://www.cdc.gov/foodsafety/outbreaks",
      raw_json: JSON.stringify(r),
      content_hash: hash,
    });
  }

  return results;
}

// ─── Normalize CDC RSS items ──────────────────────────────────────────────────

export async function normalizeCdcRss(items: RssOutbreak[]): Promise<NormalizedRecord[]> {
  const results: NormalizedRecord[] = [];

  for (const r of items) {
    const normalized = {
      title: cleanText(r.title) || "CDC Food Safety Alert",
      reason: cleanText(r.description),
      classification: "Class I" as const,
      status: "ongoing" as const,
      recalling_firm: "Multiple",
      product_description: cleanText(r.title),
      product_quantity: null,
      distribution_pattern: null,
      recall_initiation_date: normalizeDate(r.pubDate),
      termination_date: null,
      report_date: normalizeDate(r.pubDate),
    };

    const hash = await contentHash(normalized);

    results.push({
      source: "cdc",
      source_id: r.id || `cdc-rss-${hash.slice(0, 12)}`,
      ...normalized,
      source_url: r.link || "https://www.cdc.gov/foodsafety",
      raw_json: JSON.stringify(r),
      content_hash: hash,
    });
  }

  return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchCdc(): Promise<NormalizedRecord[]> {
  console.log("[cdc] Starting fetch...");

  const [jsonRecords, rssItems] = await Promise.all([
    fetchCdcJson(),
    fetchCdcRss(),
  ]);

  const [fromJson, fromRss] = await Promise.all([
    normalizeCdcJson(jsonRecords),
    normalizeCdcRss(rssItems),
  ]);

  // Deduplicate by source_id
  const seen = new Set<string>();
  const all: NormalizedRecord[] = [];
  for (const r of [...fromJson, ...fromRss]) {
    if (!seen.has(r.source_id)) {
      seen.add(r.source_id);
      all.push(r);
    }
  }

  console.log(`[cdc] Normalized ${all.length} records (${fromJson.length} JSON + ${fromRss.length} RSS, deduped)`);
  return all;
}
