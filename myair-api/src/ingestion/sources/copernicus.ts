import type { NormalizedRecord } from "../../shared/types";
import { contentHash, cleanText } from "../normalize";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Copernicus Atmosphere Monitoring Service (CAMS) / ADS.
 * @see https://atmosphere.copernicus.eu/
 * @see https://ads.atmosphere.copernicus.eu/
 *
 * Key: set CAMS_API_KEY or COPERNICUS_KEY in env, or use %USERPROFILE%\.cdsapirc (Windows)
 * or $HOME/.cdsapirc with:
 *   url: https://ads.atmosphere.copernicus.eu/api
 *   key: YOUR_PERSONAL_ACCESS_TOKEN
 *
 * Full CAMS datasets are often job-based (submit → poll → download). This implementation
 * tries a simple catalog/info request when key is present; if the API is job-only, we
 * return [] until a job-based client is added.
 */

const ADS_BASE = "https://ads.atmosphere.copernicus.eu/api";

function getKey(): string | null {
  const fromEnv = process.env.CAMS_API_KEY ?? process.env.COPERNICUS_KEY ?? process.env.CDSAPI_KEY;
  if (fromEnv) return fromEnv;
  const home = process.env.USERPROFILE ?? process.env.HOME ?? "";
  if (!home) return null;
  const rcPath = join(home, ".cdsapirc");
  if (!existsSync(rcPath)) return null;
  try {
    const text = readFileSync(rcPath, "utf-8");
    const keyLine = text.split(/\r?\n/).find((l) => /^\s*key\s*:/.test(l));
    if (!keyLine) return null;
    const key = keyLine.replace(/^\s*key\s*:\s*/, "").trim();
    return key || null;
  } catch {
    return null;
  }
}

export async function fetchCopernicus(): Promise<NormalizedRecord[]> {
  const key = getKey();
  if (!key) return [];

  try {
    // Try a lightweight catalog or info endpoint if available; many ADS APIs use POST
    const res = await fetch(`${ADS_BASE}/v2/catalog`, {
      headers: {
        "User-Agent": "MyAir-API/0.1",
        Authorization: `Bearer ${key}`,
      },
    });
    if (!res.ok) {
      // Job-based retrieval required or wrong path; no current conditions in one call
      return [];
    }
    const data = await res.json().catch(() => null);
    if (!data || (typeof data !== "object")) return [];

    // If we get a list of datasets, emit one summary record so CAMS is "live"
    const title = "CAMS/ADS catalog available";
    const raw = typeof data === "object" ? data : { catalog: data };
    const normalized = {
      title,
      summary: cleanText("Copernicus Atmosphere Monitoring Service – catalog check"),
      location_name: null,
      location_zip: null,
      latitude: null,
      longitude: null,
      value: null,
      unit: null,
      category: "air_quality",
      observed_at: new Date().toISOString(),
      source_url: ADS_BASE,
      raw_json: JSON.stringify(raw),
    };
    const content_hash = await contentHash(normalized);
    return [
      {
        source: "copernicus",
        source_id: `cams-catalog-${Date.now()}`,
        ...normalized,
        content_hash,
      },
    ];
  } catch {
    return [];
  }
}
