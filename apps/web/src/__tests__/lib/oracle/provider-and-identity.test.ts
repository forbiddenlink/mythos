import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const anthropicFactory = vi.hoisted(() =>
  vi.fn((id: string) => ({ id, p: "anthropic" })),
);
const groqFactory = vi.hoisted(() =>
  vi.fn((id: string) => ({ id, p: "groq" })),
);

vi.mock("@ai-sdk/anthropic", () => ({ anthropic: anthropicFactory }));
vi.mock("@ai-sdk/groq", () => ({ groq: groqFactory }));
vi.mock("@/lib/logger", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), exception: vi.fn() },
}));

import { logger } from "@/lib/logger";
import { getOracleClientIdentity } from "@/lib/oracle/client-identity";
import {
  __resetProviderLogForTests,
  DEFAULT_ANTHROPIC_MODEL,
  getOracleModelSelection,
  resolveOracleProvider,
} from "@/lib/oracle/provider";

describe("oracle provider resolution", () => {
  beforeEach(() => {
    vi.stubEnv("ORACLE_PROVIDER", "");
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("ANTHROPIC_ORACLE_MODEL", "");
    __resetProviderLogForTests();
    anthropicFactory.mockClear();
    groqFactory.mockClear();
    vi.mocked(logger.error).mockClear();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("prefers Anthropic by default and keeps the default model", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "a");
    vi.stubEnv("GROQ_API_KEY", "g");
    const sel = getOracleModelSelection();
    expect(sel?.provider).toBe("anthropic");
    expect(anthropicFactory).toHaveBeenCalledWith(DEFAULT_ANTHROPIC_MODEL);
  });

  it("falls back to Groq only in default mode, and logs it", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "a");
    vi.stubEnv("GROQ_API_KEY", "g");
    anthropicFactory.mockImplementationOnce(() => {
      throw new Error("bad model");
    });
    const sel = getOracleModelSelection();
    expect(sel?.provider).toBe("groq");
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(/falling back to Groq/),
      expect.anything(),
    );
  });

  it("never falls back when ORACLE_PROVIDER pins Anthropic", () => {
    vi.stubEnv("ORACLE_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "a");
    vi.stubEnv("GROQ_API_KEY", "g");
    anthropicFactory.mockImplementationOnce(() => {
      throw new Error("bad model");
    });
    expect(getOracleModelSelection()).toBeNull();
    expect(groqFactory).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(/failed to construct the anthropic model/),
      expect.anything(),
    );
  });

  it("is unavailable (not Groq) when the pinned provider has no key", () => {
    vi.stubEnv("ORACLE_PROVIDER", "anthropic");
    vi.stubEnv("GROQ_API_KEY", "g");
    expect(resolveOracleProvider()).toBeNull();
    expect(getOracleModelSelection()).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /ORACLE_PROVIDER=anthropic but its API key is not set/,
      ),
      expect.anything(),
    );
  });

  it("uses Groq when pinned and keyed", () => {
    vi.stubEnv("ORACLE_PROVIDER", "groq");
    vi.stubEnv("ANTHROPIC_API_KEY", "a");
    vi.stubEnv("GROQ_API_KEY", "g");
    expect(getOracleModelSelection()?.provider).toBe("groq");
  });

  it("logs an invalid ORACLE_PROVIDER and uses default precedence", () => {
    vi.stubEnv("ORACLE_PROVIDER", "openai");
    vi.stubEnv("GROQ_API_KEY", "g");
    expect(resolveOracleProvider()).toBe("groq");
    expect(logger.error).toHaveBeenCalledTimes(1);
  });
});

describe("oracle client identity", () => {
  it("uses the platform IP when present", () => {
    expect(
      getOracleClientIdentity(
        new Headers({ "x-vercel-forwarded-for": "198.51.100.7, 10.0.0.1" }),
      ),
    ).toEqual({ kind: "ip", key: "198.51.100.7" });
    expect(
      getOracleClientIdentity(
        new Headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }),
      ),
    ).toEqual({ kind: "ip", key: "2.2.2.2" });
  });

  it("does not lump IP-less clients into one shared key", () => {
    const a = getOracleClientIdentity(new Headers({ "user-agent": "curl/8" }));
    const b = getOracleClientIdentity(
      new Headers({ "user-agent": "Mozilla/5.0" }),
    );
    expect(a.kind).toBe("anonymous");
    expect(a.key).toMatch(/^anon:[0-9a-f]{8}$/);
    expect(a.key).not.toBe(b.key);
    expect(
      getOracleClientIdentity(new Headers({ "user-agent": "curl/8" })),
    ).toEqual(a);
  });
});
