import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AtlasOpensHero } from "@/components/home/AtlasOpensHero";

describe("homepage hero image discovery", () => {
  it("exposes the CSS mask preload in server HTML and requests the plate at its actual responsive width", () => {
    const html = renderToStaticMarkup(
      <AtlasOpensHero
        counts={{ pantheons: 40, deities: 200, stories: 100 }}
        index={[]}
        figure={{
          name: "Shiva",
          slug: "shiva",
          imageUrl: "/deities/shiva.webp",
          tradition: "Hindu",
        }}
      />,
    );
    const document = new DOMParser().parseFromString(html, "text/html");
    const preload = document.querySelector(
      'link[rel="preload"][href="/hero-star-chart.webp"]',
    );
    expect(preload).not.toBeNull();
    expect(preload?.getAttribute("as")).toBe("image");
    expect(preload?.getAttribute("crossorigin")).toBe("anonymous");
    expect(preload?.getAttribute("fetchpriority")).toBe("high");
    // React hoists the preload ahead of the hero, so discovery need not wait for CSS.
    expect(html.indexOf('href="/hero-star-chart.webp"')).toBeLessThan(
      html.indexOf("engraved-sky"),
    );
    const image = document.querySelector("img");
    expect(image?.getAttribute("sizes")).toBe(
      "(min-width: 1280px) 22.5rem, (min-width: 1024px) 21.5rem, (min-width: 640px) 20.5rem, 15.5rem",
    );
    expect(image?.getAttribute("loading")).toBe("eager");
    expect(image?.getAttribute("fetchpriority")).toBe("high");
  });

  it("reads the running head as separate phrases", () => {
    const html = renderToStaticMarkup(
      <AtlasOpensHero
        counts={{ pantheons: 40, deities: 200, stories: 100 }}
        index={[]}
      />,
    );
    const document = new DOMParser().parseFromString(html, "text/html");
    const head = document.querySelector("nav h2");
    expect(head?.textContent).toBe("Index of traditions, Deities");
    expect(head?.textContent).not.toContain("traditionsDeities");
  });
});
