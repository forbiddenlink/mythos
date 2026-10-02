import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RenderWhenVisible } from "@/components/ui/render-when-visible";

type Callback = (entries: Array<{ isIntersecting: boolean }>) => void;

let callback: Callback | undefined;
const observe = vi.fn();
const disconnect = vi.fn();

class FakeObserver {
  constructor(cb: Callback) {
    callback = cb;
  }
  observe = observe;
  disconnect = disconnect;
}

function renderIt() {
  return render(
    <RenderWhenVisible fallback={<p>placeholder</p>}>
      <p>heavy content</p>
    </RenderWhenVisible>,
  );
}

describe("RenderWhenVisible", () => {
  beforeEach(() => {
    callback = undefined;
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", FakeObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows only the fallback until the wrapper nears the viewport", () => {
    renderIt();
    expect(screen.getByText("placeholder")).toBeTruthy();
    expect(screen.queryByText("heavy content")).toBeNull();
    expect(observe).toHaveBeenCalledTimes(1);
  });

  it("ignores non-intersecting entries", () => {
    renderIt();
    act(() => callback?.([{ isIntersecting: false }]));
    expect(screen.queryByText("heavy content")).toBeNull();
  });

  it("swaps in the content once, then stops observing", () => {
    renderIt();
    act(() => callback?.([{ isIntersecting: true }]));
    expect(screen.getByText("heavy content")).toBeTruthy();
    expect(screen.queryByText("placeholder")).toBeNull();
    expect(disconnect).toHaveBeenCalled();
  });

  it("renders the content straight away without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    renderIt();
    expect(screen.getByText("heavy content")).toBeTruthy();
  });
});
