import type { LearningStorageKey } from "@/lib/learning-backup";

// Keep the latest failed writes in this tab until storage recovers or the
// reader exports them. Never report a successful save after a storage error.
const pending = new Map<string, string>();
const listeners = new Set<() => void>();

export function subscribeToLearningSaves(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function unsavedLearningCount(): number {
  return pending.size;
}

export function saveLearningValue(
  key: LearningStorageKey,
  value: string,
): void {
  try {
    localStorage.setItem(key, value);
    pending.delete(key);
  } catch {
    pending.set(key, value);
  }
  listeners.forEach((listener) => {
    listener();
  });
}

export function retryLearningSaves(): void {
  for (const [key, value] of pending) {
    saveLearningValue(key as LearningStorageKey, value);
  }
}

/** Backups include unsaved changes, not just the older persisted version. */
export function readLearningValue(key: string): string | null {
  return pending.get(key) ?? localStorage.getItem(key);
}
