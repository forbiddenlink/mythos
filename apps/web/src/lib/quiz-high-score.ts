/**
 * Guarded read/write for the per-quiz high-score keys in localStorage.
 * Storage can be blocked or full, and a stored value can be junk, so neither
 * direction is allowed to throw or to return a non-finite or negative number.
 */

export function readHighScore(key: string): number {
  try {
    const raw = localStorage.getItem(key);
    // Only a plain non-negative integer counts; "1.5" or "12garbage" is junk.
    if (raw === null || !/^\d+$/.test(raw)) return 0;
    const parsed = Number(raw);
    return Number.isSafeInteger(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export function writeHighScore(key: string, score: number): void {
  if (!Number.isFinite(score) || score < 0) return;
  try {
    localStorage.setItem(key, String(Math.floor(score)));
  } catch {
    // Keep the result visible even when browser storage is full or blocked.
  }
}
