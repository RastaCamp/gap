import type { NormalizedRecord } from "../../shared/types";
import {
  contentHash, normalizeClassification, normalizeStatus,
  normalizeDate, cleanText
} from "../normalize";

// ─── FoodSafety.gov ───────────────────────────────────────────────────────────
// FoodSafety.gov aggregates recalls from FDA, USDA, and CDC in one RSS feed.
// We use this as a cross-reference and to catch anything missed by direct feeds.
// Records here are marked source="foodsafety" and deduplicated downstream.

const FOODSAFETY_RSS_URL = "https://www.foodsafety.gov/subscribe/rss.xml";

// FoodSafety also has a recalls page with structured data
const FOODSAFETY_RECALLS_URL = "https://www.foodsafety.gov/recalls-and-alerts";

interface FoodSafetyRssItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string;
  agency: string; // Extracted from categories
}

// ─── Parse RSS ────────────────────────────────────────────────────────────────

export async function fetchFoodSafetyRss(): Promise<FoodSafetyRssItem[]> {
  try {
    const res = await fetch(FOODSAFETY_RSS_URL, {
      headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return items.map(([, inner], idx) => {
      const getTag = (tag: string) =>
        inner.match(new RegExp(`<${tag}><!\[CDATA\[(.*?)\]\]>`, "s"))?.[1] ??
        inner.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`, "s"))?.[1] ?? "";

      const title       = cleanText(getTag("title"));
      const description = cleanText(getTag("description").replace(/<[^>]+>/g, " "));
      const link        = getTag("link").trim();
      const pubDate     = getTag("pubDate").trim();
      const guid        = getTag("guid").trim() || link || `fs-${idx}`;

      // FoodSafety.gov categories often contain the agency name
      const categories  = [...inner.matchAll(/<category[^>]*>(.*?)<\/category>/g)].map(m => cleanText(m[1]));
      const agency      = categories.find(c => /fda|usda|cdc/i.test(c)) ?? "";

      return { id: guid, title, description, link, pubDate, category: categories.join(", "), agency };
    });
  } catch (e) {
    console.warn("[foodsafety] RSS fetch failed:", e);
    return [];
  }
}

// ─── Normalize ────────────────────────────────────────────────────────────────

export async function normalizeFoodSafetyRss(items: FoodSafetyRssItem[]): Promise<NormalizedRecord[]> {
  const results: NormalizedRecord[] = [];

  for (const r of items) {
    // Attempt to extract classification from description
    const classMatch = r.description.match(/Class\s+(I{1,3}|1|2|3)/i);
    const classification = normalizeClassification(classMatch?.[0] ?? "");

    // Try to extract firm name from title pattern: "Company recalls Product"
    const firmMatch = r.title.match(/^(.+?)\s+(?:recalls?|withdraws?|alerts?)\s+/i);
    const firm = cleanText(firmMatch?.[1] ?? "");

    // Status hint from title/description
    const isClosed = /closed|terminated|completed/i.test(r.description);

    const normalized = {
      title: r.title || "FoodSafety.gov Alert",
      reason: r.description,
      classification,
      status: isClosed ? "completed" as const : "ongoing" as const,
      recalling_firm: firm,
      product_description: r.title,
      product_quantity: null,
      distribution_pattern: null,
      recall_initiation_date: normalizeDate(r.pubDate),
      termination_date: null,
      report_date: normalizeDate(r.pubDate),
    };

    const hash = await contentHash(normalized);

    results.push({
      source: "foodsafety",
      source_id: r.id || `fs-${hash.slice(0, 16)}`,
      ...normalized,
      source_url: r.link || "https://www.foodsafety.gov/recalls-and-alerts",
      raw_json: JSON.stringify(r),
      content_hash: hash,
    });
  }

  return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchFoodSafety(): Promise<NormalizedRecord[]> {
  console.log("[foodsafety] Starting fetch...");
  const items = await fetchFoodSafetyRss();
  const normalized = await normalizeFoodSafetyRss(items);
  console.log(`[foodsafety] Normalized ${normalized.length} records`);
  return normalized;
}
