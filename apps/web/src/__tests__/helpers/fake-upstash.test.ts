import { describe, expect, it } from "vitest";

import {
  CAS_SET,
  GUARD,
  INDEX_SET,
  LOCK_RELEASE,
  MAX_SET,
  REPAIR_CLEAR,
  REPAIR_SET_NEWEST,
} from "@/lib/newsletter-redemption";

import {
  createFakeRedis,
  evalScript,
  fakeRatelimitModule,
  fakeRedisModule,
} from "./fake-upstash";

describe("fake-upstash eval", () => {
  it("LOCK_RELEASE deletes only when the token matches", async () => {
    const fake = createFakeRedis();
    fake.kv.set("lock", "mine");
    expect(await evalScript(fake, LOCK_RELEASE, ["lock"], ["other"])).toBe(0);
    expect(fake.kv.has("lock")).toBe(true);
    expect(await evalScript(fake, LOCK_RELEASE, ["lock"], ["mine"])).toBe(1);
    expect(fake.kv.has("lock")).toBe(false);
  });

  it("CAS_SET swaps only when the current value matches", async () => {
    const fake = createFakeRedis();
    fake.kv.set("k", "pending:1");
    expect(
      await evalScript(fake, CAS_SET, ["k"], ["pending:2", "done", "9"]),
    ).toBe(0);
    expect(fake.kv.get("k")).toBe("pending:1");
    expect(
      await evalScript(fake, CAS_SET, ["k"], ["pending:1", "done", "9"]),
    ).toBe(1);
    expect(fake.kv.get("k")).toBe("done");
  });

  it("CAS_SET throws once when evalFails is armed", async () => {
    const fake = createFakeRedis();
    fake.kv.set("k", "p");
    fake.evalFails = true;
    await expect(
      evalScript(fake, CAS_SET, ["k"], ["p", "done", "9"]),
    ).rejects.toThrow("redis down");
    expect(await evalScript(fake, CAS_SET, ["k"], ["p", "done", "9"])).toBe(1);
  });

  it("GUARD returns 0 claim lost, 2 unsubscribed since, 1 ok", async () => {
    const fake = createFakeRedis();
    fake.kv.set("claim", "m");
    expect(
      await evalScript(fake, GUARD, ["claim", "unsub"], ["x", "100"]),
    ).toBe(0);
    expect(
      await evalScript(fake, GUARD, ["claim", "unsub"], ["m", "100"]),
    ).toBe(1);
    fake.kv.set("unsub", "100");
    expect(
      await evalScript(fake, GUARD, ["claim", "unsub"], ["m", "100"]),
    ).toBe(2);
    expect(
      await evalScript(fake, GUARD, ["claim", "unsub"], ["m", "101"]),
    ).toBe(1);
  });

  it("INDEX_SET writes the hash field unconditionally", async () => {
    const fake = createFakeRedis();
    await evalScript(fake, INDEX_SET, ["h"], ["f", "a", "60"]);
    await evalScript(fake, INDEX_SET, ["h"], ["f", "b", "60"]);
    expect(fake.hashes.get("h")?.get("f")).toBe("b");
  });

  it("MAX_SET keeps the larger number", async () => {
    const fake = createFakeRedis();
    await evalScript(fake, MAX_SET, ["m"], ["10", "60"]);
    await evalScript(fake, MAX_SET, ["m"], ["5", "60"]);
    expect(fake.kv.get("m")).toBe("10");
    await evalScript(fake, MAX_SET, ["m"], ["20", "60"]);
    expect(fake.kv.get("m")).toBe("20");
  });

  it("REPAIR_SET_NEWEST keeps the newest record and rejects an older or equal one", async () => {
    const fake = createFakeRedis();
    const set = (value: string, atMs: number) =>
      evalScript(
        fake,
        REPAIR_SET_NEWEST,
        ["h"],
        ["f", value, "60", String(atMs)],
      );
    expect(await set("100:a", 100)).toBe(1);
    expect(await set("50:b", 50)).toBe(0);
    expect(await set("100:c", 100)).toBe(0);
    expect(fake.hashes.get("h")?.get("f")).toBe("100:a");
    expect(await set("200:d", 200)).toBe(1);
    expect(fake.hashes.get("h")?.get("f")).toBe("200:d");
  });

  it("REPAIR_SET_NEWEST overwrites a record with no parsable timestamp", async () => {
    const fake = createFakeRedis();
    fake.hashes.set("h", new Map([["f", "garbage"]]));
    expect(
      await evalScript(fake, REPAIR_SET_NEWEST, ["h"], ["f", "7:x", "60", "7"]),
    ).toBe(1);
    expect(fake.hashes.get("h")?.get("f")).toBe("7:x");
  });

  it("REPAIR_CLEAR is compare-and-delete and drops an emptied hash", async () => {
    const fake = createFakeRedis();
    fake.hashes.set("h", new Map([["f", "100:a"]]));
    expect(await evalScript(fake, REPAIR_CLEAR, ["h"], ["f", "999:z"])).toBe(0);
    expect(fake.hashes.get("h")?.get("f")).toBe("100:a");
    expect(await evalScript(fake, REPAIR_CLEAR, ["h"], ["f", "100:a"])).toBe(1);
    expect(fake.hashes.has("h")).toBe(false);
    const { Redis } = fakeRedisModule(fake);
    expect(await new Redis().hgetall("h")).toBeNull();
  });

  it("throws for an unmodeled Lua script", async () => {
    const fake = createFakeRedis();
    await expect(
      evalScript(
        fake,
        'return redis.call("hset", KEYS[1], "a", "b")',
        ["h"],
        [],
      ),
    ).rejects.toThrow("unmodeled Lua script");
  });

  it("does not match a script by substring", async () => {
    const fake = createFakeRedis();
    await expect(
      evalScript(fake, `${INDEX_SET} `, ["h"], ["f", "a", "60"]),
    ).rejects.toThrow("unmodeled Lua script");
  });

  it("failRepairWrites fails any eval on the repair hash", async () => {
    const fake = createFakeRedis();
    fake.failRepairWrites = true;
    await expect(
      evalScript(
        fake,
        REPAIR_CLEAR,
        ["mythos:newsletter:consent-repair"],
        ["f", "v"],
      ),
    ).rejects.toThrow("repair store down");
  });
});

describe("fake-upstash client hooks", () => {
  it("lockContended refuses lock keys only", async () => {
    const fake = createFakeRedis();
    const { Redis } = fakeRedisModule(fake);
    const redis = new Redis();
    fake.lockContended = true;
    expect(
      await redis.set("mythos:newsletter:lock:a", "t", { nx: true, px: 1 }),
    ).toBeNull();
    expect(await redis.set("other", "v", { nx: true })).toBe("OK");
  });

  it("incrFails throws and counters otherwise count", async () => {
    const fake = createFakeRedis();
    const { Redis } = fakeRedisModule(fake);
    const redis = new Redis();
    expect(await redis.incr("c")).toBe(1);
    expect(await redis.incr("c")).toBe(2);
    fake.incrFails = true;
    await expect(redis.incr("c")).rejects.toThrow("down");
  });

  it("ratelimit follows limit and counts calls", async () => {
    const fake = createFakeRedis();
    const { Ratelimit } = fakeRatelimitModule(fake);
    const rl = new Ratelimit();
    expect(await rl.limit()).toEqual({ success: true });
    fake.limit = async () => ({ success: false });
    expect(await rl.limit()).toEqual({ success: false });
    expect(fake.limitCalls).toBe(2);
  });
});
