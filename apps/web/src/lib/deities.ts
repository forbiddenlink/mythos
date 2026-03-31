import deitiesData from "@/data/deities.json";

interface DeityLookup {
  id: string;
  name: string;
  slug: string;
  alternateNames?: string[];
}

const allDeities = deitiesData as DeityLookup[];

export function normalizeDeityReference(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const deityReferenceMap = new Map<string, DeityLookup>();

for (const deity of allDeities) {
  deityReferenceMap.set(normalizeDeityReference(deity.id), deity);
  deityReferenceMap.set(normalizeDeityReference(deity.slug), deity);

  for (const alternateName of deity.alternateNames || []) {
    deityReferenceMap.set(normalizeDeityReference(alternateName), deity);
  }
}

export function findDeityByReference(
  reference: string,
): DeityLookup | undefined {
  return deityReferenceMap.get(normalizeDeityReference(reference));
}

export function formatDeityReference(reference: string): string {
  return reference
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getDeitySlug(reference: string): string {
  return (
    findDeityByReference(reference)?.slug ?? normalizeDeityReference(reference)
  );
}

export function getDeityName(reference: string): string {
  return (
    findDeityByReference(reference)?.name ?? formatDeityReference(reference)
  );
}

export function getDeityPath(reference: string): string {
  return `/deities/${getDeitySlug(reference)}`;
}
