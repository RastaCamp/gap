/**
 * Link-out helpers for registries that have no bulk API (e.g. NSOPW).
 * Use for MVP: open official or state search in browser; do not block on bulk access.
 * @see https://www.nsopw.gov/
 */

import { URLSearchParams } from "url";

/** NSOPW national search (by name/address). */
export const NSOPW_SEARCH = "https://www.nsopw.gov/";

/** Maryland DPSCS sex offender registry search. */
export const MARYLAND_REGISTRY_BASE = "https://dpscs.maryland.gov/onlineservs/socem/default.shtml";

/** California Megan's Law sex offender registry. */
export const CALIFORNIA_REGISTRY_BASE = "https://www.meganslaw.ca.gov/";

/** Texas DPS sex offender registry. */
export const TEXAS_REGISTRY_BASE = "https://records.txdps.state.tx.us/SexOffenderRegistry";

/** Florida FDLE sex offender registry. */
export const FLORIDA_REGISTRY_BASE = "https://offender.fdle.state.fl.us/offender/sops/home";

export interface StateRegistryLink {
  state: string;
  name: string;
  searchUrl: string;
}

/**
 * State-level sex offender registry search URLs (no bulk API; link-out only).
 * Add more states as needed; NSOPW has no public bulk/API.
 */
export function getStateRegistryLinks(): StateRegistryLink[] {
  return [
    { state: "MD", name: "Maryland", searchUrl: MARYLAND_REGISTRY_BASE },
    { state: "CA", name: "California", searchUrl: CALIFORNIA_REGISTRY_BASE },
    { state: "TX", name: "Texas", searchUrl: TEXAS_REGISTRY_BASE },
    { state: "FL", name: "Florida", searchUrl: FLORIDA_REGISTRY_BASE },
  ];
}

/**
 * Build Maryland registry search URL (query params if provided).
 */
export function buildMarylandRegistryLink(opts: { last_name?: string; zip_code?: string } = {}): string {
  const params = new URLSearchParams();
  if (opts.last_name) params.set("last_name", opts.last_name);
  if (opts.zip_code) params.set("zip", opts.zip_code);
  const qs = params.toString();
  return qs ? `${MARYLAND_REGISTRY_BASE}?${qs}` : MARYLAND_REGISTRY_BASE;
}

/**
 * Build NSOPW contact URL for bulk/API inquiries (no self-serve developer API).
 */
export const NSOPW_CONTACT = "https://www.nsopw.gov/contact-us";
