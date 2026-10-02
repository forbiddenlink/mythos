import { describe, it, expect } from "vitest";
import { z } from "zod";

// The site CSP has no 'unsafe-eval'. Zod 4 probes `new Function("")` while
// building a schema unless jitless is on, which the browser reports as a CSP
// violation on every page. Each module that ships to the client and builds
// schemas must turn it off before its first schema.
describe("zod jitless (CSP-safe)", () => {
  it.each([
    ["learning-backup", () => import("@/lib/learning-backup")],
    ["newsletter", () => import("@/lib/newsletter")],
    ["schemas", () => import("@/lib/schemas")],
  ])("%s disables the eval probe", async (_name, load) => {
    await load();
    expect(z.config().jitless).toBe(true);
  });

  it("builds and parses object schemas without calling the Function constructor", async () => {
    await import("@/lib/zod-jitless");
    const probe = Function;
    const calls: unknown[] = [];
    const Spy = new Proxy(probe, {
      construct(target, args) {
        calls.push(args);
        return Reflect.construct(target, args);
      },
      apply(target, thisArg, args) {
        calls.push(args);
        return Reflect.apply(target, thisArg, args);
      },
    });
    globalThis.Function = Spy as FunctionConstructor;
    try {
      const schema = z.object({ a: z.string(), b: z.number().optional() });
      expect(schema.parse({ a: "x" })).toEqual({ a: "x" });
    } finally {
      globalThis.Function = probe;
    }
    expect(calls).toEqual([]);
  });
});
