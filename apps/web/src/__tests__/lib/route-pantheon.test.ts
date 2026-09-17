import { describe, expect, it } from "vitest";
import {
  DEITY_PANTHEON_MAP,
  STORY_PANTHEON_MAP,
  resolveRoutePantheonId,
} from "@/lib/route-pantheon";

describe("route-pantheon mapping", () => {
  it("maps known deities to their pantheons", () => {
    expect(DEITY_PANTHEON_MAP.zeus).toBe("greek-pantheon");
    expect(DEITY_PANTHEON_MAP.odin).toBe("norse-pantheon");
    expect(DEITY_PANTHEON_MAP.anubis).toBe("egyptian-pantheon");
    expect(DEITY_PANTHEON_MAP.amaterasu).toBe("japanese-pantheon");
    expect(DEITY_PANTHEON_MAP["sun-wukong"]).toBe("chinese-pantheon");
    expect(DEITY_PANTHEON_MAP.shiva).toBe("hindu-pantheon");
  });

  it("maps known stories to their pantheons", () => {
    expect(STORY_PANTHEON_MAP.titanomachy).toBe("greek-pantheon");
    expect(STORY_PANTHEON_MAP.ragnarok).toBe("norse-pantheon");
  });

  it("resolves pantheon routes", () => {
    expect(resolveRoutePantheonId("/pantheons/greek")).toBe("greek-pantheon");
    expect(resolveRoutePantheonId("/pantheons/norse")).toBe("norse-pantheon");
    expect(resolveRoutePantheonId("/pantheons/egyptian")).toBe(
      "egyptian-pantheon",
    );
  });

  it("resolves deity detail routes", () => {
    expect(resolveRoutePantheonId("/deities/zeus")).toBe("greek-pantheon");
    expect(resolveRoutePantheonId("/deities/odin")).toBe("norse-pantheon");
    expect(resolveRoutePantheonId("/deities/thor")).toBe("norse-pantheon");
    expect(resolveRoutePantheonId("/deities/unknown-deity-xyz")).toBeNull();
  });

  it("resolves story detail routes", () => {
    expect(resolveRoutePantheonId("/stories/titanomachy")).toBe(
      "greek-pantheon",
    );
    expect(resolveRoutePantheonId("/stories/ragnarok")).toBe("norse-pantheon");
  });

  it("returns null for non-cultural and empty routes", () => {
    expect(resolveRoutePantheonId(null)).toBeNull();
    expect(resolveRoutePantheonId("/")).toBeNull();
    expect(resolveRoutePantheonId("/about")).toBeNull();
    expect(resolveRoutePantheonId("/timeline")).toBeNull();
  });
});
