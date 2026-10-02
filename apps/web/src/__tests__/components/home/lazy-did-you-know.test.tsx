import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LazyDidYouKnow } from "@/components/home/LazyDidYouKnow";

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;
let callback: Callback | undefined;

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe("LazyDidYouKnow", () => {
  beforeEach(() => {
    callback = undefined;
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the 13rem skeleton first, the same box DidYouKnow shows before mount", () => {
    const { container } = render(<LazyDidYouKnow deityLookup={{}} />);
    const skeleton = screen.getByTestId("did-you-know-skeleton");
    expect(skeleton.querySelector(".h-52")).not.toBeNull();
    expect(container.textContent).not.toContain("Did you know?");
  });

  it("loads the real component with a fact once it nears the viewport", async () => {
    render(<LazyDidYouKnow deityLookup={{}} />);
    act(() => callback?.([{ isIntersecting: true }]));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Did you know?" }),
      ).toBeTruthy(),
    );
    expect(
      screen.getByRole("button", { name: "Show another mythology fact" }),
    ).toBeTruthy();
  });
});
