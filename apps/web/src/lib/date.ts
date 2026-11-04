/**
 * Date helpers that use the user's local timezone.
 * Avoid UTC-based day rollovers from toISOString().
 */

export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalToday(): string {
  return toLocalDateString(new Date());
}

export function getLocalYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toLocalDateString(date);
}

export function addDaysToLocalDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}
