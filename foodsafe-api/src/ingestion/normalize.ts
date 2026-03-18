import type { NormalizedRecord, RecallClassification, RecallStatus, SourceName } from "../shared/types";

// ─── Hashing ──────────────────────────────────────────────────────────────────

/**
 * Stable content hash for diff detection.
 * We hash a normalized subset (not raw_json) so whitespace/field-order changes
 * don't produce false-positive diffs.
 */
export async function contentHash(obj: object): Promise<string> {
  const stable = JSON.stringify(obj, Object.keys(obj).sort());
  const bytes = new TextEncoder().encode(stable);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40); // 40 hex chars is plenty
}

// ─── Classification normalization ─────────────────────────────────────────────

const CLASS_MAP: Record<string, RecallClassification> = {
  "class i": "Class I",
  "class 1": "Class I",
  "class ii": "Class II",
  "class 2": "Class II",
  "class iii": "Class III",
  "class 3": "Class III",
};

export function normalizeClassification(raw: string | undefined | null): RecallClassification {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().trim();
  return CLASS_MAP[key] ?? "unknown";
}

// ─── Status normalization ─────────────────────────────────────────────────────

const STATUS_MAP: Record<string, RecallStatus> = {
  ongoing: "ongoing",
  open: "ongoing",
  active: "ongoing",
  completed: "completed",
  closed: "completed",
  terminated: "terminated",
  cancelled: "terminated",
};

export function normalizeStatus(raw: string | undefined | null): RecallStatus {
  if (!raw) return "unknown";
  const key = raw.toLowerCase().trim();
  return STATUS_MAP[key] ?? "unknown";
}

// ─── Date normalization ───────────────────────────────────────────────────────

/**
 * Attempt to parse messy date strings into ISO 8601 YYYY-MM-DD.
 * Returns null if unparseable.
 */
export function normalizeDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (!cleaned) return null;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) return cleaned.slice(0, 10);

  // MM/DD/YYYY
  const mdy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Month DD, YYYY
  const monthNames: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };
  const mdyl = cleaned.match(/^([a-z]+)\s+(\d{1,2}),?\s+(\d{4})/i);
  if (mdyl) {
    const [, m, d, y] = mdyl;
    const mo = monthNames[m.toLowerCase()];
    if (mo) return `${y}-${mo}-${d.padStart(2, "0")}`;
  }

  // Fallback: let Date parse it
  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /* ignore */ }

  return null;
}

// ─── State extraction from distribution text ──────────────────────────────────

const US_STATES: Record<string, string> = {
  "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
  "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
  "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
  "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
  "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
  "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
  "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
  "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
  "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
  "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
  "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
  "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
  "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
};

const STATE_ABBREVS = new Set(Object.keys(US_STATES));
const STATE_NAMES_LOWER = new Map(
  Object.entries(US_STATES).map(([abbr, name]) => [name.toLowerCase(), abbr])
);

export function extractStates(distributionText: string | null | undefined): string[] {
  if (!distributionText) return [];

  // Nationwide variants
  const nationwide = /nationwide|national|all\s+states|all\s+50/i;
  if (nationwide.test(distributionText)) return ["NATIONWIDE"];

  const found = new Set<string>();

  // Match 2-letter state codes preceded by space, comma, or start of string
  const abbrevMatches = distributionText.match(/\b([A-Z]{2})\b/g) ?? [];
  for (const m of abbrevMatches) {
    if (STATE_ABBREVS.has(m)) found.add(m);
  }

  // Match full state names
  for (const [nameLower, abbr] of STATE_NAMES_LOWER) {
    if (distributionText.toLowerCase().includes(nameLower)) found.add(abbr);
  }

  return Array.from(found).sort();
}

// ─── Text cleanup ─────────────────────────────────────────────────────────────

export function cleanText(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

// ─── Source ID generation ─────────────────────────────────────────────────────

export function makeSourceId(source: SourceName, raw: string): string {
  // Clean the ID to remove URL noise
  return `${source}:${raw.replace(/^https?:\/\/[^/]+\/recalls?\//i, "").trim()}`;
}
