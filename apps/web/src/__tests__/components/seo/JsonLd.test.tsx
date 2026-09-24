import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  DeityJsonLd,
} from "@/components/seo/JsonLd";

function renderBreadcrumb(name: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(
    <BreadcrumbJsonLd
      items={[{ name, item: "https://mythosatlas.com/stories" }]}
    />,
  );
  return container;
}

describe("structured data server rendering", () => {
  it("includes parseable breadcrumbs before client hydration", () => {
    const container = renderBreadcrumb("Stories");
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const data = JSON.parse(script?.textContent ?? "null");
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement[0].name).toBe("Stories");
  });

  it("preserves text without allowing it to close the script element", () => {
    const name = '</script><img src=x onerror="alert(1)">';
    const container = renderBreadcrumb(name);
    expect(container.querySelectorAll("script")).toHaveLength(1);
    expect(container.querySelector("img")).toBeNull();
    const data = JSON.parse(
      container.querySelector("script")?.textContent ?? "null",
    );
    expect(data.itemListElement[0].name).toBe(name);
  });
});

describe("structured data identity", () => {
  it("uses the project icon and only the verified repository identity", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(<OrganizationJsonLd />);
    const data = JSON.parse(
      container.querySelector("script")?.textContent ?? "null",
    );
    expect(data["@type"]).toBe("Organization");
    expect(data.logo).toBe("https://mythosatlas.com/icon.png");
    expect(data.sameAs).toEqual(["https://github.com/forbiddenlink/mythos"]);
  });
  it("does not classify a mythological figure as a historical person", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToStaticMarkup(
      <DeityJsonLd
        name="Zeus"
        description="A Greek mythological figure"
        url="/deities/zeus"
      />,
    );
    const data = JSON.parse(
      container.querySelector("script")?.textContent ?? "null",
    );
    expect(data["@type"]).not.toContain("Person");
    expect(data["@type"]).toContain("Thing");
  });
});
