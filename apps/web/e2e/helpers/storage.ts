import type { Page } from "@playwright/test";

/** Raw localStorage value in the page, or null when the key is unset. */
export async function readStored(
  page: Page,
  key: string,
): Promise<string | null> {
  return page.evaluate((storageKey) => localStorage.getItem(storageKey), key);
}

/** Stored JSON value, or null when the key is unset. */
export async function readStoredJson<T>(
  page: Page,
  key: string,
): Promise<T | null> {
  const raw = await readStored(page, key);
  return raw === null ? null : (JSON.parse(raw) as T);
}
