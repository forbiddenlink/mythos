/**
 * In-memory stand-in for @upstash/redis and @upstash/ratelimit.
 *
 * `eval` dispatches by IDENTITY against the Lua script constants exported from
 * `@/lib/newsletter-redemption`, never by substring, so a script that changes
 * shape cannot silently be modeled as a different one. An unrecognised script
 * throws "unmodeled Lua script".
 *
 * Use from a test with vi.mock hoisting:
 *
 *   const fake = await vi.hoisted(async () =>
 *     (await import("../helpers/fake-upstash")).createFakeRedis());
 *   vi.mock("@upstash/redis", async () =>
 *     (await import("../helpers/fake-upstash")).fakeRedisModule(fake));
 *   vi.mock("@upstash/ratelimit", async () =>
 *     (await import("../helpers/fake-upstash")).fakeRatelimitModule(fake));
 */
import { vi } from "vitest";

const LOCK_PREFIX = "mythos:newsletter:lock:";
const REPAIR_HASH = "mythos:newsletter:consent-repair";

export interface FakeRedis {
  kv: Map<string, string>;
  hashes: Map<string, Map<string, string>>;
  counters: Map<string, number>;
  /** Set once the Redis constructor has run. */
  touched: boolean;
  /** Next set() (not a lock) commits but throws, like a lost acknowledgement. */
  lostAck: boolean;
  /** The next CAS_SET eval (pending -> done) throws. */
  evalFails: boolean;
  /** While true, taking any consent lock fails as if another holder had it. */
  lockContended: boolean;
  /** While true, every eval against the consent-repair hash throws. */
  failRepairWrites: boolean;
  /** While true, incr() throws. */
  incrFails: boolean;
  /** What Ratelimit.limit() does next; undefined = allow. */
  limit: undefined | (() => Promise<Record<string, unknown>>);
  /** Number of Ratelimit.limit() calls. */
  limitCalls: number;
  /** Clears all state and hooks. */
  reset: () => void;
}

export function createFakeRedis(): FakeRedis {
  const fake: FakeRedis = {
    kv: new Map(),
    hashes: new Map(),
    counters: new Map(),
    touched: false,
    lostAck: false,
    evalFails: false,
    lockContended: false,
    failRepairWrites: false,
    incrFails: false,
    limit: undefined,
    limitCalls: 0,
    reset() {
      fake.kv.clear();
      fake.hashes.clear();
      fake.counters.clear();
      fake.touched = false;
      fake.lostAck = false;
      fake.evalFails = false;
      fake.lockContended = false;
      fake.failRepairWrites = false;
      fake.incrFails = false;
      fake.limit = undefined;
      fake.limitCalls = 0;
    },
  };
  return fake;
}

type Scripts = typeof import("@/lib/newsletter-redemption");

// Resolved lazily: importing the lib here would load @upstash/redis (this
// fake) while the fake is still being constructed.
let loadedScripts: Scripts | undefined;
let scriptsPromise: Promise<Scripts> | undefined;
function scripts(): Promise<Scripts> {
  scriptsPromise ??= import("@/lib/newsletter-redemption").then((m) => {
    loadedScripts = m;
    return m;
  });
  return scriptsPromise;
}

function hashFor(fake: FakeRedis, key: string): Map<string, string> {
  let hash = fake.hashes.get(key);
  if (!hash) {
    hash = new Map();
    fake.hashes.set(key, hash);
  }
  return hash;
}

/** Executes one known Lua script against `fake`, mirroring its Lua text. */
export async function evalScript(
  fake: FakeRedis,
  script: string,
  keys: string[],
  args: string[],
): Promise<number> {
  // Once loaded, take no extra microtask ticks: some tests settle with a
  // fixed number of ticks.
  const s = loadedScripts ?? (await scripts());
  if (keys[0] === REPAIR_HASH && fake.failRepairWrites) {
    throw new Error("repair store down");
  }
  switch (script) {
    case s.LOCK_RELEASE: {
      // get == ARGV[1] then del
      if (fake.kv.get(keys[0]!) !== args[0]) return 0;
      fake.kv.delete(keys[0]!);
      return 1;
    }
    case s.CAS_SET: {
      if (fake.evalFails) {
        fake.evalFails = false;
        throw new Error("redis down");
      }
      if (fake.kv.get(keys[0]!) !== args[0]) return 0;
      fake.kv.set(keys[0]!, args[1]!);
      return 1;
    }
    case s.GUARD: {
      // 0 claim lost, 2 reader unsubscribed at or after the issue time, 1 ok.
      if (fake.kv.get(keys[0]!) !== args[0]) return 0;
      const unsub = fake.kv.get(keys[1]!);
      if (unsub !== undefined && Number(unsub) >= Number(args[1])) return 2;
      return 1;
    }
    case s.INDEX_SET: {
      hashFor(fake, keys[0]!).set(args[0]!, args[1]!);
      return 1;
    }
    case s.MAX_SET: {
      const cur = fake.kv.get(keys[0]!);
      if (cur === undefined || Number(cur) < Number(args[0])) {
        fake.kv.set(keys[0]!, args[0]!);
      }
      return 1;
    }
    case s.REPAIR_CLEAR: {
      // hget == ARGV[2] then hdel; an emptied hash disappears like in Redis.
      const hash = fake.hashes.get(keys[0]!);
      if (hash?.get(args[0]!) !== args[1]) return 0;
      hash.delete(args[0]!);
      if (hash.size === 0) fake.hashes.delete(keys[0]!);
      return 1;
    }
    case s.REPAIR_SET_NEWEST: {
      // Keep the newest record: skip when the stored "<atMs>:..." >= ARGV[4].
      const hash = hashFor(fake, keys[0]!);
      const cur = hash.get(args[0]!);
      if (cur !== undefined) {
        const m = /^(\d+):/.exec(cur);
        if (m && Number(m[1]) >= Number(args[3])) return 0;
      }
      hash.set(args[0]!, args[1]!);
      return 1;
    }
    default:
      throw new Error(`unmodeled Lua script: ${script.slice(0, 80)}`);
  }
}

export function fakeRedisModule(fake: FakeRedis) {
  return {
    Redis: class {
      constructor() {
        fake.touched = true;
        void scripts();
      }
      async set(
        key: string,
        value: string,
        opts: { nx?: boolean; ex?: number; px?: number } = {},
      ) {
        // Yield so concurrent callers genuinely interleave.
        await Promise.resolve();
        const isLock = key.startsWith(LOCK_PREFIX);
        if (isLock && fake.lockContended) return null;
        if (opts.nx && fake.kv.has(key)) return null;
        fake.kv.set(key, value);
        if (fake.lostAck && !isLock) {
          fake.lostAck = false;
          fake.evalFails = false;
          // Tests then advance the clock with vi.setSystemTime.
          vi.useFakeTimers({ toFake: ["Date"] });
          throw new Error("ack lost");
        }
        return "OK";
      }
      async get(key: string) {
        return fake.kv.get(key) ?? null;
      }
      async hgetall(key: string) {
        const hash = fake.hashes.get(key);
        return hash && hash.size > 0 ? Object.fromEntries(hash) : null;
      }
      // Not async: wrapping the promise would add microtask ticks.
      eval(script: string, keys: string[], args: string[]) {
        return evalScript(fake, script, keys, args);
      }
      async incr(key: string) {
        if (fake.incrFails) throw new Error("down");
        const v = (fake.counters.get(key) ?? 0) + 1;
        fake.counters.set(key, v);
        return v;
      }
      async expire() {
        return 1;
      }
    },
  };
}

export function fakeRatelimitModule(fake: FakeRedis) {
  return {
    Ratelimit: class {
      static slidingWindow() {
        return {};
      }
      async limit() {
        fake.limitCalls += 1;
        return fake.limit ? fake.limit() : { success: true };
      }
    },
  };
}
