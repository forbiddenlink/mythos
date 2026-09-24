export type CatalogQuery = Record<string, string | string[] | undefined>;

export function queryValue(
  query: CatalogQuery,
  key: string,
): string | undefined {
  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
}

export function catalogPage(query: CatalogQuery): number {
  const value = queryValue(query, "page") ?? "1";
  const page = Number(value);
  return /^\d+$/.test(value) && Number.isSafeInteger(page) && page > 0
    ? page
    : 1;
}
