import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

/**
 * U.S. Drought Monitor — area in drought by severity.
 * @see https://droughtmonitor.unl.edu/DmData/DataDownload/WebServiceInfo.aspx
 * Base URL: https://usdmdataservices.unl.edu/api/
 * No API key required. Use ACCEPT: application/json for JSON.
 *
 * Endpoints used:
 * - National: USStatistics/GetDroughtSeverityStatisticsByArea?aoi=conus&startdate=...&enddate=...&statisticsType=1
 * - State: StateStatistics/GetDroughtSeverityStatisticsByArea?aoi=<FIPS>&...
 */

const DROUGHT_BASE = "https://usdmdataservices.unl.edu/api";

function dateRange(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return {
    start: `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`,
    end: `${end.getMonth() + 1}/${end.getDate()}/${end.getFullYear()}`,
  };
}

export async function fetchDrought(): Promise<NormalizedRecord[]> {
  const { start, end } = dateRange();
  const records: NormalizedRecord[] = [];
  const statType = "1"; // Area

  try {
    const nationalUrl = `${DROUGHT_BASE}/USStatistics/GetDroughtSeverityStatisticsByArea?aoi=conus&startdate=${encodeURIComponent(start)}&enddate=${encodeURIComponent(end)}&statisticsType=${statType}`;
    const res = await fetch(nationalUrl, {
      headers: { "User-Agent": "WaterSafe-API/0.1", "Accept": "application/json" },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const rows = Array.isArray(data) ? data : (data as { Table?: unknown[] })?.Table ?? [];
    if (rows.length === 0 && data && typeof data === "object" && !Array.isArray(data)) {
      records.push(await createDroughtRecord("conus", "U.S. (CONUS) drought statistics", data, start, end));
    } else {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as Record<string, unknown>;
        const aoi = String(row.AOI ?? row.aoi ?? row.State ?? row.state ?? "conus");
        const title = cleanText(String(row.MapDate ?? row.ValidStart ?? row.ValidEnd ?? row.Week ?? aoi)) || `Drought ${aoi}`;
        records.push(await createDroughtRecord(`conus-${i}`, title, row, start, end));
      }
    }

    if (records.length === 0 && data)
      records.push(await createDroughtRecord("conus", "U.S. Drought Monitor national", data, start, end));
  } catch {
    return [];
  }

  return records;
}

async function createDroughtRecord(
  sourceId: string,
  title: string,
  raw: Record<string, unknown> | unknown,
  start: string,
  end: string
): Promise<NormalizedRecord> {
  const summary = `U.S. Drought Monitor statistics ${start}–${end}. See raw_json for severity breakdown.`;
  const normalized = {
    title: cleanText(title) || "Drought statistics",
    summary: cleanText(summary),
    system_name: "U.S. Drought Monitor",
    system_id: null,
    location_zip: null,
    state: null,
    compliance: null,
    reported_at: normalizeDate(end),
    source_url: "https://droughtmonitor.unl.edu/",
    raw_json: JSON.stringify(raw),
  };
  const hash = await contentHash(normalized);
  return {
    source: "drought",
    source_id: sourceId.slice(0, 100),
    ...normalized,
    content_hash: hash,
  };
}
