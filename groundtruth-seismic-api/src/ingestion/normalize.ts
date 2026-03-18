import type { SourceName } from "../shared/types";

export async function contentHash(obj: object): Promise<string> {
  const stable = JSON.stringify(obj, Object.keys(obj).sort());
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(stable));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

export function cleanText(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/\s+/g, " ").trim();
}

export function normalizeDate(raw: string | number | undefined | null): string | null {
  if (raw == null) return null;
  if (typeof raw === "number") return new Date(raw).toISOString().slice(0, 19).replace("T", " ");
  const d = new Date(raw as string);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 19).replace("T", " ");
  return null;
}
