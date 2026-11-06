import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShareButton } from "@/components/sharing/ShareButton";

vi.mock("@/lib/analytics/events", () => ({ trackEvent: vi.fn() }));

function setup(writeText: () => Promise<void>) {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: { writeText },
  });
  document.execCommand = vi.fn().mockReturnValue(false);
  return render(
    <ShareButton title="t" text="x" url="https://example.test/a" />,
  );
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ShareButton copy state", () => {
  it("clears the manual-copy alert when the popover closes", async () => {
    setup(() => Promise.reject(new Error("denied")));
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    await act(async () => {
      fireEvent.click(await screen.findByText("Copy Link"));
    });
    expect(await screen.findByRole("alert")).toBeTruthy();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    expect(screen.queryByRole("alert")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    await screen.findByText("Copy Link");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("clears the copied timer on unmount", async () => {
    const { unmount } = setup(() => Promise.resolve());
    fireEvent.click(screen.getByRole("button", { name: /share/i }));
    const set = vi.spyOn(globalThis, "setTimeout");
    await act(async () => {
      fireEvent.click(await screen.findByText("Copy Link"));
    });
    // Other libraries (Radix focus handling) schedule their own timers, so
    // track the 2s "Copied" reset timer by its handle.
    const copiedCall = set.mock.calls.findIndex(([, ms]) => ms === 2000);
    expect(copiedCall).toBeGreaterThanOrEqual(0);
    const handle = set.mock.results[copiedCall]!.value;
    const clear = vi.spyOn(globalThis, "clearTimeout");
    unmount();
    expect(clear).toHaveBeenCalledWith(handle);
  });
});
