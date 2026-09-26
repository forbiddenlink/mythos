import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  DeityJsonLd,
  HeroJsonLd,
  PlaceJsonLd,
  SourceWorkJsonLd,
  placeSubject,
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
    expect(data["@type"]).toBe("Article");
    expect(data.about["@type"]).toBe("Thing");
    expect(JSON.stringify(data)).not.toContain('"Person"');
  });
});

function parse(markup: string) {
  const container = document.createElement("div");
  container.innerHTML = markup;
  return JSON.parse(container.querySelector("script")?.textContent ?? "null");
}

describe("entity structured data", () => {
  it("types a hero as a Thing in its tradition and cites catalog works as Books", () => {
    const data = parse(
      renderToStaticMarkup(
        <HeroJsonLd
          name="Odysseus"
          description="King of Ithaca"
          url="/heroes/odysseus"
          tradition="Greek"
          citations={[
            { title: "Odyssey", author: "Homer", url: "/sources/odyssey" },
            { title: "Popol Vuh", author: "Anonymous K'iche' Maya" },
          ]}
        />,
      ),
    );
    expect(data.about["@type"]).toBe("Thing");
    expect(data.about.disambiguatingDescription).toBe(
      "Legendary hero in Greek tradition",
    );
    expect(data.citation[0]).toEqual({
      "@type": "Book",
      name: "Odyssey",
      author: { "@type": "Person", name: "Homer" },
      url: "https://mythosatlas.com/sources/odyssey",
    });
    // An anonymous tradition is not turned into a named author.
    expect(data.citation[1].author).toBeUndefined();
  });

  it("gives geo coordinates only to physical places", () => {
    expect(
      placeSubject({ geography: "physical", latitude: 1, longitude: 2 }).about,
    ).toEqual({
      "@type": "Place",
      geo: { "@type": "GeoCoordinates", latitude: 1, longitude: 2 },
    });
    expect(
      placeSubject({ geography: "identified", latitude: 1, longitude: 2 })
        .about,
    ).toEqual({ "@type": "Place" });
    expect(
      placeSubject({ geography: "mythic", latitude: null, longitude: null })
        .about,
    ).toEqual({ "@type": "Thing" });
  });

  it("renders a place entry as an Article about the place", () => {
    const data = parse(
      renderToStaticMarkup(
        <PlaceJsonLd
          name="Ithaca"
          description="Island kingdom of Odysseus"
          url="/locations/ithaca"
          geography="physical"
          latitude={38.366}
          longitude={20.718}
          locationType="realm"
          tradition="Greek"
        />,
      ),
    );
    expect(data.about.geo.latitude).toBe(38.366);
    expect(data.about.disambiguatingDescription).toBe(
      "Real realm in Greek tradition",
    );
  });

  it("describes a source work as a Book with its translators", () => {
    const data = parse(
      renderToStaticMarkup(
        <SourceWorkJsonLd
          title="Odyssey"
          description="Homer's epic"
          url="/sources/odyssey"
          author="Homer"
          translators={["Emily Wilson"]}
          characters={[{ name: "Odysseus", url: "/heroes/odysseus" }]}
        />,
      ),
    );
    expect(data["@type"]).toBe("Book");
    expect(data.workTranslation[0].translator.name).toBe("Emily Wilson");
    expect(data.character[0]["@type"]).toBe("Thing");
  });
});
