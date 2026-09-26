import { describe, expect, it } from "vitest";
import de from "../../../../messages/de.json";
import en from "../../../../messages/en.json";
import es from "../../../../messages/es.json";
import fr from "../../../../messages/fr.json";
import {
  MOBILE_MORE_NAV,
  PRIMARY_DIRECT_LINK,
  PRIMARY_NAV,
} from "@/components/layout/nav-config";
import { CONSOLIDATION_REDIRECTS } from "@/lib/route-redirects";

const locales = { en, es, fr, de } as Record<
  string,
  {
    navigation: Record<string, string>;
    navDescriptions: Record<string, string>;
  }
>;

const primaryLinks = [
  ...PRIMARY_NAV.flatMap((group) => group.items),
  PRIMARY_DIRECT_LINK,
];

describe("primary navigation", () => {
  it("stays compact (about half the old 24 header links)", () => {
    expect(PRIMARY_NAV.map((g) => g.titleKey)).toEqual([
      "explore",
      "visualize",
      "learn",
    ]);
    expect(primaryLinks.length).toBeLessThanOrEqual(16);
  });

  it("never links a retired route", () => {
    const retired = new Set(CONSOLIDATION_REDIRECTS.map((r) => r.source));
    for (const item of [...primaryLinks, ...MOBILE_MORE_NAV.items]) {
      expect(retired.has(item.href), item.href).toBe(false);
    }
  });

  it("gates the Oracle on NEXT_PUBLIC_ORACLE_ENABLED", () => {
    const hasOracle = primaryLinks.some((item) => item.href === "/oracle");
    expect(hasOracle).toBe(process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true");
  });

  it.each(Object.keys(locales))("has every label in %s", (locale) => {
    const { navigation, navDescriptions } = locales[locale];
    for (const group of [...PRIMARY_NAV, MOBILE_MORE_NAV]) {
      expect(navigation[group.titleKey], group.titleKey).toBeTruthy();
      for (const item of group.items) {
        expect(navigation[item.labelKey], item.labelKey).toBeTruthy();
        if (item.descriptionKey) {
          expect(
            navDescriptions[item.descriptionKey],
            item.descriptionKey,
          ).toBeTruthy();
        }
      }
    }
    expect(navigation[PRIMARY_DIRECT_LINK.labelKey]).toBeTruthy();
    // The oracle description exists even when the link is hidden.
    expect(navDescriptions.oracle).toBeTruthy();
  });
});
