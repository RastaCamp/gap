import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";
import { readFile } from "fs/promises";

/**
 * EWG Tap Water Database.
 * @see https://www.ewg.org/tapwater/
 *
 * No public API; data is provided as datasets (CSV/Excel) or reports.
 *
 * To use:
 * 1. Download data from EWG (e.g. https://www.ewg.org/tapwater/ — check for data export or reports).
 * 2. Save as CSV or JSON and set one of:
 *    - EWG_CSV_PATH — path to CSV (expected columns: utility/system name, zip, state, contaminants/summary, url; headers optional).
 *    - EWG_JSON_PATH — path to JSON file (array of { title?, summary?, system_name?, location_zip?, state?, source_url?, reported_at? }).
 *    - EWG_DATA_URL — URL that returns JSON array of same shape (if you host the file).
 * 3. Run: bun run ingest ewg (or DISABLED_SOURCES=ewg to skip if no file set).
 */

const DEFAULT_SOURCE_URL = "https://www.ewg.org/tapwater/";

interface EwgJsonRow {
  title?: string;
  summary?: string;
  system_name?: string;
  system_id?: string;
  location_zip?: string;
  state?: string;
  source_url?: string;
  reported_at?: string;
  [k: string]: unknown;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || c === "\n" || c === "\r") {
      out.push(cur.trim());
      cur = "";
      if (c !== ",") break;
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

function csvToRecords(csv: string): EwgJsonRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const headers = parseCsvLine(lines[0]);
  const rows: EwgJsonRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: EwgJsonRow = {};
    headers.forEach((h, j) => {
      const v = values[j];
      if (h && v !== undefined) row[h.toLowerCase().replace(/\s+/g, "_")] = v;
    });
    row.title = cleanText(String(row.title ?? row.system_name ?? row.utility ?? row.water_system ?? "EWG water system"));
    row.summary = cleanText(String(row.summary ?? row.contaminants ?? row.contaminant_summary ?? "EWG Tap Water Database"));
    row.system_name = row.title || null;
    row.location_zip = cleanText(String(row.location_zip ?? row.zip ?? "")) || undefined;
    row.state = cleanText(String(row.state ?? "")) || undefined;
    row.source_url = cleanText(String(row.source_url ?? row.url ?? "")) || DEFAULT_SOURCE_URL;
    rows.push(row);
  }
  return rows;
}

async function loadEwgData(): Promise<EwgJsonRow[]> {
  const csvPath = process.env.EWG_CSV_PATH;
  const jsonPath = process.env.EWG_JSON_PATH;
  const dataUrl = process.env.EWG_DATA_URL;

  if (csvPath) {
    const csv = await readFile(csvPath, "utf-8");
    return csvToRecords(csv);
  }
  if (jsonPath) {
    const raw = await readFile(jsonPath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [data];
  }
  if (dataUrl) {
    const res = await fetch(dataUrl, { headers: { "User-Agent": "WaterSafe-API/0.1" } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  }
  return [];
}

export async function fetchEwg(): Promise<NormalizedRecord[]> {
  let rows: EwgJsonRow[];
  try {
    rows = await loadEwgData();
  } catch {
    return [];
  }
  if (rows.length === 0) return [];

  const records: NormalizedRecord[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as EwgJsonRow;
    const title = cleanText(String(row.title ?? row.system_name ?? "EWG water system")) || "EWG water system";
    const normalized = {
      title,
      summary: cleanText(String(row.summary ?? "EWG Tap Water Database")),
      system_name: cleanText(String(row.system_name ?? title)) || null,
      system_id: row.system_id != null ? String(row.system_id) : null,
      location_zip: row.location_zip ? cleanText(String(row.location_zip)) : null,
      state: row.state ? cleanText(String(row.state)) : null,
      compliance: null,
      reported_at: normalizeDate(row.reported_at),
      source_url: cleanText(String(row.source_url ?? DEFAULT_SOURCE_URL)) || DEFAULT_SOURCE_URL,
      raw_json: JSON.stringify(row),
    };
    const hash = await contentHash(normalized);
    const sourceId = `ewg-${(row.system_id ?? row.system_name ?? i).toString().replace(/\s/g, "_").slice(0, 80)}`;
    records.push({
      source: "ewg",
      source_id: sourceId,
      ...normalized,
      content_hash: hash,
    });
  }
  return records;
}
