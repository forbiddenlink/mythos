import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LearningBackup } from "@/components/progress/LearningBackup";
import {
  createLearningBackup,
  serializeLearningBackup,
} from "@/lib/learning-backup";

function backupWithSource(id: string): string {
  const backup = createLearningBackup(localStorage);
  backup.data["mythos-atlas-bookmarks"] = JSON.stringify([
    { type: "source", id, timestamp: 1 },
  ]);
  return JSON.stringify(backup);
}

function choose(text: () => Promise<string>): void {
  fireEvent.change(
    screen.getByLabelText("Choose a Mythos Atlas learning backup JSON file"),
    {
      target: { files: [{ size: 100, text }] },
    },
  );
}

describe("learning backup controls", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the file-picker control unavailable until its client handler hydrates", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<LearningBackup />);

    expect(
      within(container).getByRole("button", {
        name: "Choose backup to review",
      }),
    ).toBeDisabled();
  });

  it("previews without changing data and allows cancelling", async () => {
    localStorage.setItem("mythos-atlas-bookmarks", "[]");
    render(<LearningBackup />);
    choose(async () => backupWithSource("iliad"));
    expect(await screen.findByText("Ready to restore")).toBeInTheDocument();
    expect(localStorage.getItem("mythos-atlas-bookmarks")).toBe("[]");
    fireEvent.click(screen.getByRole("button", { name: "Cancel restore" }));
    expect(
      screen.queryByRole("button", { name: "Restore this backup" }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem("mythos-atlas-bookmarks")).toBe("[]");
  });

  it("ignores an older read that finishes after a newer rejected selection", async () => {
    let finish!: (text: string) => void;
    const pending = new Promise<string>((resolve) => {
      finish = resolve;
    });
    render(<LearningBackup />);
    choose(() => pending);
    choose(async () => "invalid json");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "not valid JSON",
    );
    await act(async () => finish(backupWithSource("iliad")));
    expect(screen.queryByText("Ready to restore")).not.toBeInTheDocument();
  });

  it("restores the chosen source bookmark only after explicit activation", async () => {
    const reload = vi
      .spyOn(window.location, "reload")
      .mockImplementation(() => {});
    render(<LearningBackup />);
    choose(async () => backupWithSource("iliad"));
    const restore = await screen.findByRole("button", {
      name: "Restore this backup",
    });
    expect(localStorage.getItem("mythos-atlas-bookmarks")).toBeNull();
    vi.useFakeTimers();
    fireEvent.click(restore);
    expect(
      JSON.parse(localStorage.getItem("mythos-atlas-bookmarks")!)[0].id,
    ).toBe("iliad");
    await act(async () => vi.advanceTimersByTime(250));
    expect(reload).toHaveBeenCalledOnce();
    vi.useRealTimers();
    reload.mockRestore();
  });

  it("does not offer an export that import would reject", () => {
    localStorage.setItem("mythos-atlas-review", "broken json");
    expect(() => serializeLearningBackup(localStorage)).toThrow(
      "restorable backup",
    );
    expect(localStorage.getItem("mythos-atlas-review")).toBe("broken json");
  });
});
