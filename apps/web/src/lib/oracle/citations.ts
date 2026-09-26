import { getResultUrl, type SearchResult } from "@/lib/search-result";

/** An Atlas entity page the Oracle's grounding drew on (e.g. /deities/zeus). */
export interface OracleCitation {
  type: string;
  slug: string;
  title: string;
  path: string;
}

/** A primary text cited by a grounding snippet, e.g. "Hesiod, Theogony" + "116–138". */
export interface OraclePrimarySource {
  /** Author and work, as written in the catalog ("Hesiod, Theogony"). */
  title: string;
  /** Line, book, or chapter locator when the catalog records one. */
  locator?: string;
  /** Mythos Atlas source page, when the work has one (e.g. /sources/theogony). */
  path?: string;
}

/**
 * Grounding metadata streamed to the client ahead of the answer text, as a
 * `data-oracle-sources` part of the UI message stream.
 */
export interface OracleSourcesPayload {
  /** Encyclopedia snippets given to the model (0 = nothing in our sources). */
  hitCount: number;
  entities: OracleCitation[];
  primarySources: OraclePrimarySource[];
}

export const MAX_PRIMARY_SOURCES = 8;

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

/** Shapes of the primary-source fields found across the catalog JSON. */
export interface CatalogSourceFields {
  primarySourceExcerpts?: Array<{
    source?: string;
    sourceId?: string;
    lineNumbers?: string;
  }>;
  citationSources?: Array<{
    title?: string;
    author?: string;
    lines?: string;
    book?: string;
    type?: string;
  }>;
  primarySources?: Array<{ source?: string } | string>;
}

function normalizeLocator(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  // Numeric ranges read better with an en dash: "116-138" -> "116–138".
  return t.replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
}

/**
 * Pull primary-source references (title + locator) from one catalog record.
 * `knownSourceIds` lets excerpts that point at an Atlas source page link to it.
 */
export function primarySourcesFromRecord(
  record: CatalogSourceFields,
  knownSourceIds: ReadonlySet<string> = new Set(),
): OraclePrimarySource[] {
  const out: OraclePrimarySource[] = [];

  for (const e of record.primarySourceExcerpts ?? []) {
    const title = e.source?.trim();
    if (!title) continue;
    out.push({
      title,
      locator: normalizeLocator(e.lineNumbers),
      path:
        e.sourceId && knownSourceIds.has(e.sourceId)
          ? `/sources/${e.sourceId}`
          : undefined,
    });
  }

  for (const c of record.citationSources ?? []) {
    if (c.type && c.type !== "primary") continue;
    const work = c.title?.trim();
    if (!work) continue;
    const author = c.author?.trim();
    out.push({
      title: author ? `${author}, ${work}` : work,
      locator: normalizeLocator(c.lines ?? c.book),
    });
  }

  for (const p of record.primarySources ?? []) {
    const title = (typeof p === "string" ? p : p.source)?.trim();
    if (!title) continue;
    out.push({ title });
  }

  return out;
}

/** Format for prompts and plain-text display: "Hesiod, Theogony 116–138". */
export function formatPrimarySource(source: OraclePrimarySource): string {
  return source.locator ? `${source.title} ${source.locator}` : source.title;
}

/**
 * De-duplicate primary sources, preferring entries that carry a locator, and
 * dropping a bare title when a located entry for the same work exists.
 */
export function dedupePrimarySources(
  sources: OraclePrimarySource[],
  max: number = MAX_PRIMARY_SOURCES,
): OraclePrimarySource[] {
  const located = new Set(
    sources.filter((s) => s.locator).map((s) => s.title.toLowerCase()),
  );
  const seen = new Set<string>();
  const out: OraclePrimarySource[] = [];
  for (const s of sources) {
    const titleKey = s.title.toLowerCase();
    if (!s.locator && located.has(titleKey)) continue;
    const key = `${titleKey}|${s.locator ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

/** Same-site absolute path (rejects protocol-relative "//host" and schemes). */
export function isSitePath(path: unknown): path is string {
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
}

/** Validate an untrusted `data-oracle-sources` payload from the stream. */
export function parseOracleSourcesPayload(
  value: unknown,
): OracleSourcesPayload | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  const hitCount =
    typeof v.hitCount === "number" && Number.isFinite(v.hitCount)
      ? Math.max(0, Math.floor(v.hitCount))
      : 0;

  const entities = Array.isArray(v.entities)
    ? v.entities.filter(
        (x): x is OracleCitation =>
          typeof x === "object" &&
          x !== null &&
          isSitePath((x as OracleCitation).path) &&
          typeof (x as OracleCitation).title === "string" &&
          typeof (x as OracleCitation).slug === "string" &&
          typeof (x as OracleCitation).type === "string",
      )
    : [];

  const primarySources = Array.isArray(v.primarySources)
    ? v.primarySources
        .filter(
          (x): x is OraclePrimarySource =>
            typeof x === "object" &&
            x !== null &&
            typeof (x as OraclePrimarySource).title === "string",
        )
        .map((x) => ({
          title: x.title,
          locator: typeof x.locator === "string" ? x.locator : undefined,
          path: isSitePath(x.path) ? x.path : undefined,
        }))
    : [];

  return { hitCount, entities, primarySources };
}
