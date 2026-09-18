interface SourceIdentity {
  id: string;
  title: string;
}

interface SourceReference {
  sourceId?: string;
  title?: string;
  source?: string;
}

function normalizeLabel(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Explicit identities take precedence over legacy, human-readable labels. */
export function matchesSource(
  reference: SourceReference,
  source: SourceIdentity,
): boolean {
  if (reference.sourceId?.trim()) {
    return reference.sourceId.trim() === source.id;
  }

  const titles = [source.title, source.title.replace(/\([^)]*\)/g, "")]
    .map(normalizeLabel)
    .filter(Boolean);

  // Require the complete work title, bounded by words. Short fragments such
  // as "Edda" or "Mythology" must not attach a citation to multiple works.
  return [reference.title, reference.source].some((label) => {
    if (!label) return false;
    return titles.some((title) =>
      ` ${normalizeLabel(label)} `.includes(` ${title} `),
    );
  });
}
