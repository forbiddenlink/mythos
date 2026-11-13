import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HeroLantern } from "@/components/home/HeroLantern";

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function renderInSection() {
  const { container } = render(
    <section>
      <HeroLantern />
    </section>,
  );
  const section = container.querySelector("section") as HTMLElement;
  const lantern = container.querySelector(".hero-lantern") as HTMLElement;
  lantern.getBoundingClientRect = () =>
    ({ left: 100, top: 0, width: 400, height: 200 }) as DOMRect;
  return { section, lantern };
}

describe("HeroLantern", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("follows a fine pointer in the lantern's own coordinates and goes dark on leave", () => {
    mockMatchMedia(true);
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    const { section, lantern } = renderInSection();
    expect(lantern.getAttribute("aria-hidden")).toBe("true");

    act(() => {
      section.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 300, clientY: 50 }),
      );
      vi.advanceTimersToNextFrame();
    });
    expect(lantern.style.getPropertyValue("--lx")).toBe("50%");
    expect(lantern.style.getPropertyValue("--ly")).toBe("25%");
    expect(lantern.dataset.lit).toBe("true");

    act(() => {
      section.dispatchEvent(new PointerEvent("pointerleave"));
    });
    expect(lantern.dataset.lit).toBeUndefined();
  });

  it("attaches nothing on touch screens or under reduced motion", () => {
    mockMatchMedia(false);
    vi.useFakeTimers({ toFake: ["requestAnimationFrame"] });
    const { section, lantern } = renderInSection();
    act(() => {
      section.dispatchEvent(
        new PointerEvent("pointermove", { clientX: 300, clientY: 50 }),
      );
      vi.advanceTimersToNextFrame();
    });
    expect(lantern.dataset.lit).toBeUndefined();
    expect(lantern.style.getPropertyValue("--lx")).toBe("");
  });
});
