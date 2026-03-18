import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText, normalizeDate } from "../normalize";

/**
 * CityProtect — crime and incident data.
 * @see https://www.cityprotect.com/
 *
 * Access typically requires API key or partnership. No public open-data endpoint
 * is documented; contact CityProtect for developer/API access.
 *
 * To implement once you have access:
 * 1. Set env: CITYPROTECT_API_KEY and CITYPROTECT_API_URL.
 *    - API_URL: base endpoint that returns incidents (e.g. https://api.cityprotect.com/v1/incidents
 *      or the URL provided in your CityProtect developer docs).
 *    - API_KEY: your API key (sent as Authorization: Bearer <key> or X-API-Key: <key> per their docs).
 * 2. This fetcher expects the response to be a JSON array of incidents, or an object with
 *    a property that is an array (e.g. { data: [] }, { incidents: [] }, { results: [] }).
 * 3. Each incident can have: title/description/summary, type/category, address/location,
 *    zip/state, date/time, url/id. We map to NormalizedRecord.
 * 4. Run: bun run ingest cityprotect (or set DISABLED_SOURCES=cityprotect to skip if no key).
 */

function getIncidentsFromResponse(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.incidents)) return obj.incidents;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.records)) return obj.records;
  }
  return [];
}

export async function fetchCityprotect(): Promise<NormalizedRecord[]> {
  const apiKey = process.env.CITYPROTECT_API_KEY?.trim();
  const apiUrl = process.env.CITYPROTECT_API_URL?.trim();
  if (!apiKey || !apiUrl) return [];

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "NeighborhoodScore-API/0.1",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-API-Key": apiKey,
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = getIncidentsFromResponse(data);
    const records: NormalizedRecord[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown>;
      const title = cleanText(String(item.title ?? item.description ?? item.summary ?? item.type ?? item.category ?? "CityProtect incident")) || "CityProtect incident";
      const normalized = {
        title,
        summary: cleanText(String(item.summary ?? item.description ?? item.details ?? "CityProtect crime/incident data")),
        report_type: cleanText(String(item.type ?? item.category ?? item.incident_type ?? "incident")) || null,
        location_name: cleanText(String(item.address ?? item.location ?? item.place ?? "")) || null,
        location_zip: item.zip != null ? String(item.zip) : item.location_zip != null ? String(item.location_zip) : null,
        state: cleanText(String(item.state ?? "")) || null,
        value: typeof item.value === "number" ? item.value : null,
        reported_at: normalizeDate(item.date ?? item.reported_at ?? item.occurred_at ?? item.created_at),
        source_url: item.url ? String(item.url) : "https://www.cityprotect.com/",
        raw_json: JSON.stringify(item),
      };
      const hash = await contentHash(normalized);
      const sourceId = String(item.id ?? item.incident_id ?? `cityprotect-${i}`);
      records.push({
        source: "cityprotect",
        source_id: sourceId.slice(0, 200),
        ...normalized,
        content_hash: hash,
      });
    }
    return records;
  } catch {
    return [];
  }
}
