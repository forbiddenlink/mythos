import { describe, expect, it } from "vitest";
import { generateEntityAlt } from "@/lib/image-provenance";

// "zeus" is an AI illustration and "sedna" (Inuit, never generated) a procedural plate in
// src/data/image-provenance.json, so these exercise both branches.
describe("generateEntityAlt", () => {
  it("describes a deity as a deity of its tradition", () => {
    expect(
      generateEntityAlt({
        name: "Zeus",
        tradition: "Greek Pantheon",
        type: "deity",
        entityType: "deity",
        slug: "zeus",
      }),
    ).toBe("Illustration of Zeus, a deity of the Greek Pantheon");
  });

  it("does not repeat the culture for a pantheon cover", () => {
    const alt = generateEntityAlt({
      name: "Greek Pantheon",
      tradition: "Ancient Greek",
      type: "tradition",
      entityType: "pantheon",
      slug: "greek-pantheon",
    });
    expect(alt).toBe("Illustration for Greek Pantheon");
    expect(alt).not.toMatch(/Ancient Greek/);
  });

  it("uses the catalog subtype for places and artifacts, humanised", () => {
    expect(
      generateEntityAlt({
        name: "Delphi",
        tradition: "Greek Pantheon",
        type: "sacred_site",
        entityType: "location",
        slug: "delphi",
      }),
    ).toBe("Illustration of Delphi, a sacred site of the Greek Pantheon");
    expect(
      generateEntityAlt({
        name: "Underworld",
        tradition: "Greek Pantheon",
        type: "underworld",
        entityType: "location",
        slug: "underworld",
      }),
    ).toBe("Illustration of Underworld, an underworld of the Greek Pantheon");
  });

  it("falls back to the entity type when the subtype is 'other'", () => {
    expect(
      generateEntityAlt({
        name: "Odd Thing",
        type: "other",
        entityType: "artifact",
        slug: "odd-thing",
      }),
    ).toBe("Illustration of Odd Thing, an artifact");
  });

  it("quotes a story title instead of treating it as a figure", () => {
    expect(
      generateEntityAlt({
        name: "Maui Steals Fire",
        tradition: "Polynesian Pantheon",
        type: "myth",
        entityType: "story",
        slug: "maui-steals-fire",
      }),
    ).toBe(
      'Illustration of the myth "Maui Steals Fire" from the Polynesian Pantheon',
    );
  });

  it("leaves a bare culture name without an article", () => {
    expect(
      generateEntityAlt({
        name: "Hector",
        tradition: "Greek",
        type: "hero",
        entityType: "hero",
        slug: "hector-missing",
      }),
    ).toBe("Illustration of Hector, a hero of Greek");
  });

  it("omits the tradition clause when there is none", () => {
    expect(
      generateEntityAlt({
        name: "Cerberus",
        type: "creature",
        entityType: "creature",
        slug: "cerberus",
      }),
    ).toBe("Illustration of Cerberus, a creature");
  });

  it("keeps the plate wording for procedural plates", () => {
    expect(
      generateEntityAlt({
        name: "Sedna",
        tradition: "Inuit",
        type: "deity",
        entityType: "deity",
        slug: "sedna",
      }),
    ).toBe("Name plate for Sedna");
  });

  it("defaults to a figure when nothing describes the type", () => {
    expect(generateEntityAlt({ name: "Someone" })).toBe(
      "Illustration of Someone, a figure",
    );
  });
});
