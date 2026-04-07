import { getResultUrl, type SearchResult } from "@/lib/search";

export interface OracleCitation {
  type: string;
  slug: string;
  title: string;
  path: string;
}

export function citationsFromHits(hits: SearchResult[]): OracleCitation[] {
  const seen = new Set<string>();
  const out: OracleCitation[] = [];
  for (const h of hits) {
    const key = `${h.type}:${h.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      type: h.type,
      slug: h.slug,
      title: h.title,
      path: getResultUrl(h),
    });
  }
  return out;
}

function utf8ToBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(encoded: string): string {
  const pad =
    encoded.length % 4 === 0 ? "" : "====".slice(0, 4 - (encoded.length % 4));
  const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeCitationsHeader(citations: OracleCitation[]): string {
  return utf8ToBase64Url(JSON.stringify(citations));
}

export function decodeCitationsHeader(encoded: string): OracleCitation[] {
  try {
    const json = base64UrlToUtf8(encoded);
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is OracleCitation =>
        typeof x === "object" &&
        x !== null &&
        typeof (x as OracleCitation).path === "string" &&
        typeof (x as OracleCitation).title === "string" &&
        typeof (x as OracleCitation).slug === "string" &&
        typeof (x as OracleCitation).type === "string",
    );
  } catch {
    return [];
  }
}
