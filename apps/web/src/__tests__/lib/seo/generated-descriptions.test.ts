import { describe, expect, it } from "vitest";
import { generateMetadata as creatureMeta } from "@/app/creatures/[slug]/page";
import { generateMetadata as deityMeta } from "@/app/deities/[slug]/page";
import { generateMetadata as godsOfMeta } from "@/app/gods-of/[domain]/page";
import { generateMetadata as locationMeta } from "@/app/locations/[slug]/page";
import { generateMetadata as pantheonMeta } from "@/app/pantheons/[slug]/page";
import creatures from "@/data/creatures.json";
import locations from "@/data/locations.json";
import pantheons from "@/data/pantheons.json";
import { getDeities } from "@/lib/data/catalog";
import { getGodsOfDomains } from "@/lib/gods-of";

type Meta = (args: { params: Promise<Record<string, string>> }) => Promise<{
  description?: string | null;
}>;

async function descriptions(
  meta: unknown,
  key: string,
  values: string[],
): Promise<Array<[string, string]>> {
  const out: Array<[string, string]> = [];
  for (const value of values) {
    const result = await (meta as Meta)({
      params: Promise.resolve({ [key]: value }),
    });
    out.push([`${key}=${value}`, result.description ?? ""]);
  }
  return out;
}

describe("generated meta descriptions", () => {
  it("never trail off with an ellipsis or exceed 160 characters", async () => {
    const all = [
      ...(await descriptions(
        pantheonMeta,
        "slug",
        (pantheons as Array<{ slug: string }>).map((p) => p.slug),
      )),
      ...(await descriptions(
        locationMeta,
        "slug",
        (locations as Array<{ id: string }>).map((l) => l.id),
      )),
      ...(await descriptions(
        deityMeta,
        "slug",
        getDeities().map((d) => d.slug),
      )),
      ...(await descriptions(
        creatureMeta,
        "slug",
        (creatures as Array<{ slug: string }>).map((c) => c.slug),
      )),
      ...(await descriptions(
        godsOfMeta,
        "domain",
        getGodsOfDomains().map((g) => g.slug),
      )),
    ];
    expect(all.length).toBeGreaterThan(400);
    const bad = all.filter(
      ([, d]) =>
        d.length === 0 ||
        d.includes("...") ||
        d.includes("…") ||
        d.length > 160,
    );
    expect(bad).toEqual([]);
  }, 60_000);
});
