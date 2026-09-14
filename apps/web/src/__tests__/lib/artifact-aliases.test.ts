import { describe, expect, it } from "vitest";
import {
  ARTIFACT_ALIASES,
  canonicalArtifactSlug,
} from "@/lib/artifact-aliases";

describe("artifact aliases", () => {
  it("sends mismatched ids to the public slug", () => {
    expect(canonicalArtifactSlug("shangos-oshe")).toBe("oshe-of-shango");
    expect(canonicalArtifactSlug("me")).toBe("the-me");
    expect(canonicalArtifactSlug("mjolnir")).toBe("mjolnir");
  });

  it("does not alias unrelated artifacts", () => {
    expect(Object.keys(ARTIFACT_ALIASES).length).toBe(2);
  });
});
