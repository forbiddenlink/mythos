import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterConfirm } from "@/components/newsletter/NewsletterConfirm";

describe("NewsletterConfirm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("removes the token from the address bar but can still confirm with it", async () => {
    // setup.js replaces window.location, so assert on the history call.
    const replaceState = vi.spyOn(window.history, "replaceState");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewsletterConfirm token="abc.def" />);
    expect(replaceState).toHaveBeenCalledWith(
      null,
      "",
      window.location.pathname,
    );

    screen.getByRole("button", { name: "Confirm my subscription" }).click();
    await screen.findByText(/You're subscribed/);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      token: "abc.def",
    });
  });
});
