import type { NormalizedRecord } from "../../shared/types";
import {
  contentHash, normalizeClassification, normalizeStatus,
  normalizeDate, extractStates, cleanText
} from "../normalize";

// ─── USDA FSIS Recall API ─────────────────────────────────────────────────────
// USDA FSIS provides a public recall dataset as JSON
// Docs: https://www.fsis.usda.gov/recalls

const USDA_JSON_URL = "https://www.fsis.usda.gov/sites/default/files/media_file/documents/recalls.json";
const USDA_RSS_URL  = "https://www.fsis.usda.gov/rss/recalls.xml";

interface UsdaRecord {
  "Field ID": string;
  "Recall Number": string;
  "FSIS Press Release": string;
  "Date": string;
  "Recall Class": string;
  "Brand Name(s)": string;
  "Product Items": string;
  "Reason for Recall": string;
  "Est. / Plant No.": string;
  "Recall Type": string;
  "Pounds Recalled": string;
  "Distribution": string;
  "Labels Available": string;
  "Active / Closed": string;
}

// ─── Fetch USDA JSON ──────────────────────────────────────────────────────────

export async function fetchUsdaJson(): Promise<UsdaRecord[]> {
  const res = await fetch(USDA_JSON_URL, {
    headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
  });

  if (!res.ok) {
    // Fallback: attempt RSS parse
    console.warn(`[usda] JSON fetch failed (${res.status}), trying RSS...`);
    return [];
  }

  // USDA occasionally wraps in a callback or has BOM — handle gracefully
  let text = await res.text();
  if (text.startsWith("\uFEFF")) text = text.slice(1);
  if (text.trimStart().startsWith("jQuery")) {
    const match = text.match(/\[.*\]/s);
    text = match ? match[0] : "[]";
  }

  try {
    const data = JSON.parse(text);
    const records: UsdaRecord[] = Array.isArray(data) ? data : data?.data ?? [];
    console.log(`[usda] Fetched ${records.length} records from JSON`);
    return records;
  } catch (e) {
    console.error("[usda] JSON parse error:", e);
    return [];
  }
}

// ─── Fallback: fetch USDA RSS ─────────────────────────────────────────────────

export async function fetchUsdaRss(): Promise<Partial<UsdaRecord>[]> {
  const res = await fetch(USDA_RSS_URL, {
    headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
  });
  if (!res.ok) {
    console.error(`[usda] RSS fetch failed: ${res.status}`);
    return [];
  }

  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items.map(([, inner]) => {
    const title  = inner.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ?? inner.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const desc   = inner.match(/<description><!\[CDATA\[(.*?)\]\]>/s)?.[1] ?? inner.match(/<description>(.*?)<\/description>/s)?.[1] ?? "";
    const link   = inner.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = inner.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const guid   = inner.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] ?? link;

    return {
      "Field ID": guid,
      "Recall Number": guid,
      "FSIS Press Release": link,
      "Date": pubDate,
      "Recall Class": "",
      "Brand Name(s)": "",
      "Product Items": title,
      "Reason for Recall": desc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      "Distribution": "",
      "Active / Closed": "Active",
      "Pounds Recalled": "",
    };
  });
}

// ─── Normalize USDA records ───────────────────────────────────────────────────

export async function normalizeUsdaRecords(raw: Partial<UsdaRecord>[]): Promise<NormalizedRecord[]> {
  const results: NormalizedRecord[] = [];

  for (const r of raw) {
    const sourceId = r["Recall Number"] || r["Field ID"] || crypto.randomUUID();
    const productDesc = cleanText(r["Product Items"] ?? r["Brand Name(s)"]);
    const reason = cleanText(r["Reason for Recall"]);
    const firm = cleanText(r["Brand Name(s)"]);
    const distribution = cleanText(r["Distribution"]);

    const normalized = {
      title: productDesc || reason || "USDA Recall",
      reason,
      classification: normalizeClassification(r["Recall Class"]),
      status: r["Active / Closed"]?.toLowerCase().includes("active") ? "ongoing" as const : "completed" as const,
      recalling_firm: firm,
      product_description: productDesc,
      product_quantity: cleanText(r["Pounds Recalled"]) || null,
      distribution_pattern: distribution || null,
      recall_initiation_date: normalizeDate(r["Date"]),
      termination_date: null,
      report_date: normalizeDate(r["Date"]),
    };

    const hash = await contentHash(normalized);

    results.push({
      source: "usda",
      source_id: sourceId,
      ...normalized,
      source_url: r["FSIS Press Release"] || "https://www.fsis.usda.gov/recalls",
      raw_json: JSON.stringify(r),
      content_hash: hash,
    });
  }

  return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchUsda(): Promise<NormalizedRecord[]> {
  console.log("[usda] Starting fetch...");
  let raw = await fetchUsdaJson();
  if (raw.length === 0) {
    console.log("[usda] Falling back to RSS...");
    raw = await fetchUsdaRss();
  }
  const normalized = await normalizeUsdaRecords(raw);
  console.log(`[usda] Normalized ${normalized.length} records`);
  return normalized;
}
