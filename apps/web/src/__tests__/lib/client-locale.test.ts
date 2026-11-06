import { afterEach, describe, expect, it, vi } from "vitest";
import { saveLocale, LOCALE_CHANGE_EVENT } from "@/i18n/client-locale";

describe("saveLocale", () => {
  afterEach(() => {
    localStorage.clear();
    document.cookie = "locale=; max-age=0; path=/";
  });

  it("writes the cookie and announces the change, without a localStorage copy", () => {
    const listener = vi.fn();
    window.addEventListener(LOCALE_CHANGE_EVENT, listener);
    saveLocale("fr");
    window.removeEventListener(LOCALE_CHANGE_EVENT, listener);

    expect(document.cookie).toContain("locale=fr");
    expect(localStorage.getItem("locale")).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
