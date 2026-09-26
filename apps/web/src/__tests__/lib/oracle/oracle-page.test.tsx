import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/oracle/OracleConsult", () => ({
  OracleConsult: () => null,
}));
vi.mock("@/components/effects/ParchmentShaderBackground", () => ({
  ParchmentShaderBackground: () => null,
}));

import { generateMetadata } from "@/app/oracle/page";
import sitemap from "@/app/sitemap";
import { isOracleEnabled } from "@/lib/oracle/availability";

function hasOracleUrl(): boolean {
  return sitemap().some((e) => e.url.endsWith("/oracle"));
}

describe("/oracle when disabled or enabled", () => {
  beforeEach(() => {
    vi.stubEnv("ORACLE_PROVIDER", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("is noindex and absent from the sitemap when the public flag is off", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "key");
    expect(isOracleEnabled()).toBe(false);
    expect(generateMetadata().robots).toEqual({ index: false, follow: true });
    expect(hasOracleUrl()).toBe(false);
  });

  it("is noindex when the flag is on but no provider is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "true");
    expect(isOracleEnabled()).toBe(false);
    expect(generateMetadata().robots).toEqual({ index: false, follow: true });
    expect(hasOracleUrl()).toBe(false);
  });

  it("is indexable and listed when enabled with a provider", () => {
    vi.stubEnv("NEXT_PUBLIC_ORACLE_ENABLED", "true");
    vi.stubEnv("GROQ_API_KEY", "key");
    expect(isOracleEnabled()).toBe(true);
    const robots = generateMetadata().robots as { index?: boolean } | undefined;
    expect(robots?.index).not.toBe(false);
    expect(hasOracleUrl()).toBe(true);
  });
});
