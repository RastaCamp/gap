import type { NormalizedRecord, SourceName } from "../shared/types";

export async function contentHash(obj: object): Promise<string> {
  const stable = JSON.stringify(obj, Object.keys(obj).sort());
  const bytes = new TextEncoder().encode(stable);
  const buf = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 40);
}

export function cleanText(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim();
}

export function normalizeDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) return cleaned.slice(0, 10);
  try {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {}
  return null;
}
