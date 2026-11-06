import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard, shareOrCopy } from "@/lib/quiz-share";

const payload = { title: "T", text: "X", url: "https://example.test/r" };

function stubNavigator(value: Partial<Navigator>): void {
  vi.stubGlobal("navigator", value);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("shareOrCopy", () => {
  it("returns shared when the native sheet completes", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    stubNavigator({ share, clipboard: { writeText } } as never);
    await expect(shareOrCopy(payload)).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(payload);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("returns cancelled and does not copy when the sheet is dismissed", async () => {
    const share = vi
      .fn()
      .mockRejectedValue(new DOMException("dismissed", "AbortError"));
    const writeText = vi.fn();
    stubNavigator({ share, clipboard: { writeText } } as never);
    await expect(shareOrCopy(payload)).resolves.toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies when there is no native share", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ clipboard: { writeText } } as never);
    await expect(shareOrCopy(payload)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it("copies copyText instead of the url when given", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ clipboard: { writeText } } as never);
    await shareOrCopy({ ...payload, copyText: "full text" });
    expect(writeText).toHaveBeenCalledWith("full text");
  });

  it("falls back to copying after a non-abort share failure", async () => {
    const share = vi.fn().mockRejectedValue(new Error("boom"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubNavigator({ share, clipboard: { writeText } } as never);
    await expect(shareOrCopy(payload)).resolves.toBe("copied");
  });

  it("returns manual when the clipboard fails, never copied", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    stubNavigator({ clipboard: { writeText } } as never);
    document.execCommand = vi.fn().mockReturnValue(false);
    await expect(shareOrCopy(payload)).resolves.toBe("manual");
  });

  it("returns manual without trying the legacy copy by default", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    stubNavigator({ clipboard: { writeText } } as never);
    document.execCommand = vi.fn().mockReturnValue(true);
    await expect(shareOrCopy(payload)).resolves.toBe("manual");
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it("uses the legacy copy when the caller opts in", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    stubNavigator({ clipboard: { writeText } } as never);
    document.execCommand = vi.fn().mockReturnValue(true);
    await expect(shareOrCopy({ ...payload, legacyCopy: true })).resolves.toBe(
      "copied",
    );
  });
});

describe("copyToClipboard", () => {
  it("uses the legacy path when the async clipboard rejects", async () => {
    stubNavigator({
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("x")) },
    } as never);
    document.execCommand = vi.fn().mockReturnValue(true);
    await expect(copyToClipboard("hi")).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });
});
