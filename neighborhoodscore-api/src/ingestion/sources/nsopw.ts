import type { NormalizedRecord } from "../../shared/types";
import { contentHash } from "../normalize";
import { getStateRegistryLinks } from "./linkout_registry";

/**
 * NSOPW — National Sex Offender Public Website.
 * @see https://nsopw.gov/
 *
 * Lookup-only (by address or name); no public bulk or list API. This source
 * returns "link-out" records: one per supported state registry so the API can
 * expose "Search by state" without bulk data. Each record is a stable placeholder
 * pointing users to the official state registry URL.
 *
 * To add more states: extend getStateRegistryLinks() in linkout_registry.ts.
 */

export async function fetchNsopw(): Promise<NormalizedRecord[]> {
  const links = getStateRegistryLinks();
  const records: NormalizedRecord[] = [];

  for (const link of links) {
    const title = `${link.name} sex offender registry search`;
    const summary = "No bulk API. Search by name or address at the official state registry.";
    const normalized = {
      title,
      summary,
      report_type: "registry_link",
      location_name: link.name,
      location_zip: null,
      state: link.state,
      value: null,
      reported_at: null,
      source_url: link.searchUrl,
      raw_json: JSON.stringify({ state: link.state, name: link.name, searchUrl: link.searchUrl }),
    };
    const hash = await contentHash(normalized);
    records.push({
      source: "nsopw",
      source_id: `nsopw-linkout-${link.state.toLowerCase()}`,
      ...normalized,
      content_hash: hash,
    });
  }
  return records;
}
