import type { NormalizedRecord } from "../../shared/types";
import {
  contentHash, normalizeClassification, normalizeStatus,
  normalizeDate, extractStates, cleanText
} from "../normalize";

// ─── FDA OpenFDA API ──────────────────────────────────────────────────────────
// Docs: https://open.fda.gov/apis/food/enforcement/
// This endpoint returns food enforcement (recall) records as JSON.

const FDA_JSON_BASE = "https://api.fda.gov/food/enforcement.json";
const FDA_RSS_URL   = "https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/fda-medwatch-safety-alerts/rss.xml";
const PAGE_LIMIT    = 100;

interface FdaApiRecord {
  recall_number: string;
  reason_for_recall: string;
  status: string;
  distribution_pattern: string;
  product_quantity: string;
  recall_initiation_date: string;
  center_classification_date: string;
  termination_date: string;
  report_date: string;
  classification: string;
  product_description: string;
  product_type: string;
  event_id: string;
  recalling_firm: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  voluntary_mandated: string;
  initial_firm_notification: string;
  openfda: Record<string, unknown>;
  more_code_info: string;
}

interface FdaApiResponse {
  meta: { results: { total: number; skip: number; limit: number } };
  results: FdaApiRecord[];
}

// ─── Fetch all pages from the JSON API ───────────────────────────────────────

export async function fetchFdaJson(): Promise<{ raw: FdaApiRecord[]; source_url: string }> {
  const allRecords: FdaApiRecord[] = [];
  let skip = 0;
  let total = Infinity;

  while (skip < total) {
    const url = `${FDA_JSON_BASE}?search=product_type:"Food"&limit=${PAGE_LIMIT}&skip=${skip}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FoodSafe-API/0.1 (public data aggregator)" },
    });

    if (!res.ok) {
      console.error(`[fda] JSON API error: ${res.status} at skip=${skip}`);
      break;
    }

    const data: FdaApiResponse = await res.json();
    total = data.meta.results.total;
    allRecords.push(...data.results);
    skip += PAGE_LIMIT;

    // Respect rate limiting — FDA API allows ~240 req/min with no key
    if (skip < total) await Bun.sleep(250);
  }

  console.log(`[fda] Fetched ${allRecords.length} records from JSON API`);
  return { raw: allRecords, source_url: FDA_JSON_BASE };
}

// ─── Normalize FDA records ────────────────────────────────────────────────────

export async function normalizeFdaRecords(raw: FdaApiRecord[]): Promise<NormalizedRecord[]> {
  const results: NormalizedRecord[] = [];

  for (const r of raw) {
    const normalized = {
      title: cleanText(r.product_description) || cleanText(r.reason_for_recall) || "Untitled Recall",
      reason: cleanText(r.reason_for_recall),
      classification: normalizeClassification(r.classification),
      status: normalizeStatus(r.status),
      recalling_firm: cleanText(r.recalling_firm),
      product_description: cleanText(r.product_description),
      product_quantity: cleanText(r.product_quantity) || null,
      distribution_pattern: cleanText(r.distribution_pattern) || null,
      recall_initiation_date: normalizeDate(r.recall_initiation_date),
      termination_date: normalizeDate(r.termination_date),
      report_date: normalizeDate(r.report_date),
    };

    const hash = await contentHash(normalized);

    results.push({
      source: "fda",
      source_id: r.recall_number || `fda-event-${r.event_id}`,
      ...normalized,
      source_url: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
      raw_json: JSON.stringify(r),
      content_hash: hash,
    });
  }

  return results;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function fetchFda(): Promise<NormalizedRecord[]> {
  console.log("[fda] Starting fetch...");
  const { raw } = await fetchFdaJson();
  const normalized = await normalizeFdaRecords(raw);
  console.log(`[fda] Normalized ${normalized.length} records`);
  return normalized;
}
