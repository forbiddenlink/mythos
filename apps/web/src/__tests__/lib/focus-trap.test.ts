import { afterEach, describe, expect, it } from "vitest";
import { getFocusableElements } from "@/lib/a11y/focus-trap";

describe("getFocusableElements", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("returns buttons in DOM order", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<button type="button">a</button><button type="button">b</button>';
    document.body.appendChild(container);

    const els = getFocusableElements(container);
    expect(els.map((e) => e.textContent)).toEqual(["a", "b"]);
  });

  it("excludes disabled buttons", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<button type="button">a</button><button type="button" disabled>b</button>';
    document.body.appendChild(container);

    const els = getFocusableElements(container);
    expect(els).toHaveLength(1);
    expect(els[0].textContent).toBe("a");
  });

  it("includes links with href", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<a href="/x">link</a><button type="button">btn</button>';
    document.body.appendChild(container);

    const els = getFocusableElements(container);
    expect(els).toHaveLength(2);
  });

  it('skips aria-hidden="true" elements', () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<button type="button" aria-hidden="true">ghost</button><button type="button">real</button>';
    document.body.appendChild(container);

    const els = getFocusableElements(container);
    expect(els.map((e) => e.textContent)).toEqual(["real"]);
  });
});
