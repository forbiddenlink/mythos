import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readLearningValue,
  retryLearningSaves,
  saveLearningValue,
  subscribeToLearningSaves,
  unsavedLearningCount,
} from "@/lib/learning-persistence";
import { serializeLearningBackup } from "@/lib/learning-backup";

const key = "mythos-atlas-bookmarks";
let values: Map<string, string>;
let blocked: Set<string>;

beforeEach(() => {
  values = new Map();
  blocked = new Set();
  vi.stubGlobal("localStorage", {
    getItem: (name: string) => values.get(name) ?? null,
    setItem: (name: string, value: string) => {
      if (blocked.has(name))
        throw new DOMException("Full", "QuotaExceededError");
      values.set(name, value);
    },
  });
  retryLearningSaves();
  values.clear();
});

afterEach(() => vi.unstubAllGlobals());

describe("recoverable learning persistence", () => {
  it("retains the latest failed change for retry and backup", () => {
    values.set(key, "[]");
    blocked.add(key);
    saveLearningValue(
      key,
      JSON.stringify([{ type: "deity", id: "zeus", timestamp: 1 }]),
    );
    const latest = JSON.stringify([
      { type: "deity", id: "athena", timestamp: 2 },
    ]);
    saveLearningValue(key, latest);
    expect(values.get(key)).toBe("[]");
    expect(unsavedLearningCount()).toBe(1);
    const backup = JSON.parse(
      serializeLearningBackup({ getItem: readLearningValue }),
    );
    expect(backup.data[key]).toBe(latest);
    blocked.clear();
    retryLearningSaves();
    expect(values.get(key)).toBe(latest);
    expect(unsavedLearningCount()).toBe(0);
  });

  it("keeps a failed retry visible while other categories recover", () => {
    blocked.add(key);
    blocked.add("mythos-atlas-reading-progress");
    saveLearningValue(key, "[]");
    saveLearningValue("mythos-atlas-reading-progress", "{}");
    blocked.delete(key);
    retryLearningSaves();
    expect(unsavedLearningCount()).toBe(1);
    expect(values.get(key)).toBe("[]");
    expect(values.has("mythos-atlas-reading-progress")).toBe(false);
  });

  it("clears an older failure when a newer change saves successfully", () => {
    blocked.add(key);
    saveLearningValue(key, "old");
    blocked.clear();
    saveLearningValue(key, "new");
    retryLearningSaves();
    expect(readLearningValue(key)).toBe("new");
    expect(unsavedLearningCount()).toBe(0);
  });

  it("notifies mounted consumers and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToLearningSaves(listener);
    blocked.add(key);
    saveLearningValue(key, "[]");
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    blocked.clear();
    retryLearningSaves();
    expect(listener).toHaveBeenCalledOnce();
  });
});
