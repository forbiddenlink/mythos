import { existsSync } from "node:fs";
import { join } from "node:path";
import artifacts from "../../data/artifacts.json";
import pantheons from "../../data/pantheons.json";
import { ARTIFACT_ALIASES } from "@/lib/artifact-aliases";

const { describe, it, expect } = await import("vitest");

const validPantheonIds = pantheons.map((p: { id: string }) => p.id);
const publicRoot = join(__dirname, "..", "..", "..", "public");

type ArtifactRecord = {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  description: string;
  type: string;
  powers: string[];
  origin?: string;
  imageUrl?: string | null;
  detailedBio?: string;
  primarySources?: Array<{ text?: string; source?: string; date?: string }>;
};

describe("artifacts.json data integrity", () => {
  it("should have at least one artifact", () => {
    expect(artifacts.length).toBeGreaterThan(0);
  });

  it("every artifact should have required fields", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      expect(artifact.id).toBeTruthy();
      expect(artifact.name).toBeTruthy();
      expect(artifact.slug).toBeTruthy();
      expect(artifact.pantheonId).toBeTruthy();
      expect(artifact.description).toBeTruthy();
      expect(artifact.type).toBeTruthy();
      expect(Array.isArray(artifact.powers)).toBe(true);
      expect(artifact.powers.length).toBeGreaterThan(0);
      expect((artifact.origin ?? "").trim().length).toBeGreaterThan(0);
    }
  });

  it("every artifact should have a valid pantheonId", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      expect(validPantheonIds).toContain(artifact.pantheonId);
    }
  });

  it("every artifact should have a unique id, slug, and name", () => {
    const ids = artifacts.map((a: { id: string }) => a.id);
    const slugs = artifacts.map((a: { slug: string }) => a.slug);
    const names = artifacts.map((a: { name: string }) => a.name.trim());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every artifact id should match its slug", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      expect(artifact.id).toBe(artifact.slug);
    }
  });

  it("every artifact should have a detailedBio", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      expect(typeof artifact.detailedBio, artifact.id).toBe("string");
      expect(
        artifact.detailedBio!.trim().length,
        artifact.id,
      ).toBeGreaterThanOrEqual(300);
    }
  });

  it("every artifact has at least one primary source", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      expect(artifact.primarySources?.length ?? 0, artifact.id).toBeGreaterThan(
        0,
      );
      for (const source of artifact.primarySources ?? []) {
        expect(source.source?.trim().length, artifact.id).toBeGreaterThan(0);
        expect(source.text?.trim().length, artifact.id).toBeGreaterThan(0);
      }
    }
  });

  it("imageUrl, when set, points at a file in public/", () => {
    for (const artifact of artifacts as ArtifactRecord[]) {
      const url = artifact.imageUrl;
      if (!url) continue;
      expect(url.startsWith("/"), artifact.id).toBe(true);
      expect(existsSync(join(publicRoot, url.slice(1))), url).toBe(true);
    }
  });

  it("aliased duplicate slugs are not still in the catalog", () => {
    const slugs = new Set(artifacts.map((a: { slug: string }) => a.slug));
    const ids = new Set(artifacts.map((a: { id: string }) => a.id));
    for (const [from, to] of Object.entries(ARTIFACT_ALIASES)) {
      expect(slugs.has(from) || ids.has(from), from).toBe(false);
      expect(slugs.has(to), to).toBe(true);
    }
  });
});
