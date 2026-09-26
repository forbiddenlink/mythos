/**
 * Oracle eval runner.
 *
 * Calls the real `/api/oracle` POST handler in-process (imported directly,
 * no dev server required) for every case in golden-set.ts, scores the
 * response with plain assertions, prints a pass/fail table, and exits
 * non-zero if the pass rate drops below PASS_THRESHOLD.
 *
 * Makes real, billed calls to whichever provider `getOracleModel()`
 * resolves (Anthropic by default if ANTHROPIC_API_KEY is set, else Groq).
 * Run manually, locally: `pnpm --filter web eval:oracle`. Never wired into CI.
 *
 * The response body is the AI SDK UI message stream; grounding metadata
 * (hit count, entity pages, primary sources) arrives in its
 * `data-oracle-sources` part and is read with the same client helper the UI
 * uses, so citation checks exercise the real wire format.
 *
 * Each case gets a distinct fake x-forwarded-for IP so the Oracle's
 * in-memory per-IP rate limiter (10 req/hr, see src/lib/oracle/rate-limit.ts)
 * does not trip partway through a full run in the same process.
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/oracle/route";
import type { OracleSourcesPayload } from "@/lib/oracle/citations";
import { isNotInSourcesAnswer } from "@/lib/oracle/coverage";
import { readOracleStream } from "@/lib/oracle/stream-client";
import {
  type Assertion,
  type EvalCase,
  goldenSet,
  REFUSAL_PATTERNS,
} from "./golden-set";

const PASS_THRESHOLD = Number.parseFloat(
  process.env.ORACLE_EVAL_THRESHOLD ?? "0.8",
);
const ORIGIN = "http://localhost:3000";
const HOST = "localhost:3000";

interface AssertionResult {
  pass: boolean;
  detail: string;
}

interface CaseResult {
  case: EvalCase;
  pass: boolean;
  status: number;
  hitCount: number;
  citationCount: number;
  primarySourceCount: number;
  answer: string;
  assertionResults: AssertionResult[];
  error?: string;
}

function matchAny(text: string, patterns: (string | RegExp)[]): boolean {
  return patterns.some((p) =>
    typeof p === "string"
      ? text.toLowerCase().includes(p.toLowerCase())
      : p.test(text),
  );
}

/** Site paths the answer links inline as markdown, e.g. [Zeus](/deities/zeus). */
function inlineLinkedPaths(answer: string): string[] {
  return [...answer.matchAll(/\]\((\/[^)\s]+)\)/g)].map((m) => m[1]!);
}

function checkAssertion(
  assertion: Assertion,
  answer: string,
  sources: OracleSourcesPayload | null,
): AssertionResult {
  const hitCount = sources?.hitCount ?? 0;
  switch (assertion.kind) {
    case "containsAll": {
      const missing = assertion.patterns.filter((p) => !matchAny(answer, [p]));
      return {
        pass: missing.length === 0,
        detail:
          missing.length === 0
            ? `containsAll: all ${assertion.patterns.length} pattern(s) matched`
            : `containsAll: missing ${missing.map(String).join(", ")}`,
      };
    }
    case "containsAny": {
      const pass = matchAny(answer, assertion.patterns);
      return {
        pass,
        detail: pass
          ? "containsAny: matched"
          : `containsAny: none of ${assertion.patterns.map(String).join(", ")} matched`,
      };
    }
    case "notContains": {
      const hit = assertion.patterns.find((p) => matchAny(answer, [p]));
      return {
        pass: !hit,
        detail: hit
          ? `notContains: forbidden pattern matched (${String(hit)})`
          : "notContains: clean",
      };
    }
    case "refusalOrHonesty": {
      const pass = matchAny(answer, REFUSAL_PATTERNS);
      return {
        pass,
        detail: pass
          ? "refusalOrHonesty: refusal/honesty language found"
          : "refusalOrHonesty: no refusal language detected",
      };
    }
    case "staysOnTopic": {
      const pass = matchAny(answer, [
        /myth/i,
        /deity|deities/i,
        /god|goddess/i,
        /pantheon/i,
        /ancient/i,
        /oracle/i,
        /legend/i,
      ]);
      return {
        pass,
        detail: pass
          ? "staysOnTopic: mythological vocabulary present"
          : "staysOnTopic: response drifted off mythology",
      };
    }
    case "groundedHit": {
      const pass = assertion.expected ? hitCount > 0 : hitCount === 0;
      return {
        pass,
        detail: `groundedHit: expected ${assertion.expected ? ">0" : "0"}, got ${hitCount}`,
      };
    }
    case "citesAtlas": {
      // Every inline link must point at a page the grounding supplied, and
      // there must be at least one.
      const given = new Set(sources?.entities.map((e) => e.path) ?? []);
      const linked = inlineLinkedPaths(answer);
      const invented = linked.filter((p) => !given.has(p));
      const pass = linked.length > 0 && invented.length === 0;
      return {
        pass,
        detail: pass
          ? `citesAtlas: ${linked.length} inline link(s), all from grounding`
          : linked.length === 0
            ? "citesAtlas: no inline links to Atlas pages"
            : `citesAtlas: links not in grounding: ${invented.join(", ")}`,
      };
    }
    case "citesPath": {
      const pass =
        inlineLinkedPaths(answer).includes(assertion.path) ||
        (sources?.entities.some((e) => e.path === assertion.path) ?? false);
      return {
        pass,
        detail: pass
          ? `citesPath: ${assertion.path} cited`
          : `citesPath: ${assertion.path} neither linked nor in sources`,
      };
    }
    case "hasPrimarySource": {
      const pass = (sources?.primarySources.length ?? 0) > 0;
      return {
        pass,
        detail: `hasPrimarySource: ${sources?.primarySources.length ?? 0} primary source(s) streamed`,
      };
    }
    case "notInSources": {
      const pass = isNotInSourcesAnswer(answer);
      return {
        pass,
        detail: pass
          ? 'notInSources: answer opens with "Our sources don\'t cover that."'
          : "notInSources: answer did not declare the gap (possible invented myth)",
      };
    }
    default:
      return { pass: false, detail: "unknown assertion kind" };
  }
}

function fakeIp(index: number): string {
  // Distinct per case so the in-memory oracle rate limiter (10/hr per
  // identifier) never trips mid-run. See src/lib/oracle/rate-limit.ts.
  return `198.51.100.${(index % 250) + 1}`;
}

async function runCase(evalCase: EvalCase, index: number): Promise<CaseResult> {
  const messages = [
    ...(evalCase.priorMessages ?? []),
    { role: "user" as const, content: evalCase.question },
  ];

  const req = new NextRequest(`${ORIGIN}/api/oracle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: ORIGIN,
      host: HOST,
      "x-forwarded-for": fakeIp(index),
    },
    body: JSON.stringify({ messages, locale: "en" }),
  });

  try {
    const res = await POST(req);

    if (res.status !== 200 || !res.body) {
      const text = await res.text();
      return {
        case: evalCase,
        pass: false,
        status: res.status,
        hitCount: 0,
        citationCount: 0,
        primarySourceCount: 0,
        answer: text,
        assertionResults: [],
        error: `non-200 status (${res.status}): ${text}`,
      };
    }

    const { text: answer, sources } = await readOracleStream(res.body);

    const assertionResults = evalCase.assertions.map((a) =>
      checkAssertion(a, answer, sources),
    );
    const pass = assertionResults.every((r) => r.pass);

    return {
      case: evalCase,
      pass,
      status: res.status,
      hitCount: sources?.hitCount ?? 0,
      citationCount: sources?.entities.length ?? 0,
      primarySourceCount: sources?.primarySources.length ?? 0,
      answer,
      assertionResults,
    };
  } catch (error) {
    return {
      case: evalCase,
      pass: false,
      status: 0,
      hitCount: 0,
      citationCount: 0,
      primarySourceCount: 0,
      answer: "",
      assertionResults: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function printResult(result: CaseResult, index: number, total: number): void {
  const icon = result.pass ? "PASS" : "FAIL";
  console.log(
    `\n[${index + 1}/${total}] ${icon}  ${result.case.id}  (${result.case.category})`,
  );
  console.log(`  Q: ${result.case.question}`);
  if (result.error) {
    console.log(`  ERROR: ${result.error}`);
    return;
  }
  console.log(
    `  hits=${result.hitCount} entities=${result.citationCount} primarySources=${result.primarySourceCount}`,
  );
  for (const ar of result.assertionResults) {
    console.log(`  ${ar.pass ? "  ok" : " MISS"}  ${ar.detail}`);
  }
  const preview = result.answer.replace(/\s+/g, " ").slice(0, 200);
  console.log(`  A: ${preview}${result.answer.length > 200 ? "…" : ""}`);
}

function printSummaryTable(results: CaseResult[]): void {
  console.log(`\n${"=".repeat(72)}`);
  console.log("SUMMARY");
  console.log("=".repeat(72));

  const byCategory = new Map<string, { pass: number; total: number }>();
  for (const r of results) {
    const bucket = byCategory.get(r.case.category) ?? { pass: 0, total: 0 };
    bucket.total += 1;
    if (r.pass) bucket.pass += 1;
    byCategory.set(r.case.category, bucket);
  }

  for (const [category, { pass, total }] of byCategory) {
    console.log(`  ${category.padEnd(16)} ${pass}/${total}`);
  }

  const totalPass = results.filter((r) => r.pass).length;
  const passRate = results.length === 0 ? 0 : totalPass / results.length;
  console.log("-".repeat(72));
  console.log(
    `  TOTAL            ${totalPass}/${results.length}  (${(passRate * 100).toFixed(1)}%)`,
  );
  console.log(`  Threshold: ${(PASS_THRESHOLD * 100).toFixed(0)}%`);
  console.log("=".repeat(72));

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.log("\nFailed cases:");
    for (const r of failed) {
      console.log(
        `  - ${r.case.id}: ${
          r.error ??
          r.assertionResults
            .filter((a) => !a.pass)
            .map((a) => a.detail)
            .join("; ")
        }`,
      );
    }
  }

  if (passRate < PASS_THRESHOLD) {
    console.log(
      `\nFAIL: pass rate ${(passRate * 100).toFixed(1)}% is below threshold ${(PASS_THRESHOLD * 100).toFixed(0)}%`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      `\nOK: pass rate ${(passRate * 100).toFixed(1)}% meets threshold ${(PASS_THRESHOLD * 100).toFixed(0)}%`,
    );
  }
}

async function main(): Promise<void> {
  const onlyId = process.argv
    .find((a) => a.startsWith("--case="))
    ?.split("=")[1];
  const cases = onlyId ? goldenSet.filter((c) => c.id === onlyId) : goldenSet;

  if (cases.length === 0) {
    console.error(
      `No matching case${onlyId ? ` for --case=${onlyId}` : ""}. Nothing to run.`,
    );
    process.exitCode = 1;
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY && !process.env.GROQ_API_KEY) {
    console.error(
      "Neither ANTHROPIC_API_KEY nor GROQ_API_KEY is set. The Oracle has no model provider configured.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Running ${cases.length} Oracle eval case(s) against the real /api/oracle handler...`,
  );
  console.log("This makes real, billed LLM calls. Do not run this in CI.\n");

  const results: CaseResult[] = [];
  for (const [index, evalCase] of cases.entries()) {
    const result = await runCase(evalCase, index);
    results.push(result);
    printResult(result, index, cases.length);
  }

  printSummaryTable(results);
}

main().catch((error) => {
  console.error("Eval runner crashed:", error);
  process.exitCode = 1;
});
