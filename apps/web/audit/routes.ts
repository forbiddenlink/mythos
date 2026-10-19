import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { quizResultPath } from "../src/lib/quiz-share";

const webRoot = path.resolve(__dirname, "..");
const runLabel = process.env.AUDIT_RUN_LABEL;
if (runLabel && !/^[a-z0-9-]+$/.test(runLabel)) {
  throw new Error(
    "AUDIT_RUN_LABEL must use lowercase letters, numbers, or hyphens.",
  );
}
export const evidenceRoot = path.resolve(
  webRoot,
  "../../functional-review/evidence/2026-10-18",
  runLabel ?? ".",
);
interface InventoryEntry {
  file: string;
  pattern: string;
  route: string;
}
interface BuiltRoute {
  srcRoute?: string;
}

function pages(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? pages(file)
      : entry.name === "page.tsx"
        ? [file]
        : [];
  });
}

/** Fail closed on new dynamic patterns: a live build must identify a real representative. */
export function currentRoutes(): InventoryEntry[] {
  const hints = JSON.parse(
    readFileSync(
      path.resolve(webRoot, "../../functional-review/inventory.json"),
      "utf8",
    ),
  ) as InventoryEntry[];
  const built = JSON.parse(
    readFileSync(path.join(webRoot, ".next/prerender-manifest.json"), "utf8"),
  ) as { routes: Record<string, BuiltRoute> };
  const appRoot = path.join(webRoot, "src/app");
  return pages(appRoot)
    .sort()
    .map((file) => {
      const pattern = `/${path
        .relative(appRoot, path.dirname(file))
        .split(path.sep)
        .filter((part) => part && !part.startsWith("("))
        .join("/")}`;
      const relativeFile = `apps/web/${path.relative(webRoot, file).split(path.sep).join("/")}`;
      const hint = hints.find((entry) => entry.file === relativeFile);
      if (!pattern.includes("["))
        return { file: relativeFile, pattern, route: pattern };
      if (pattern === "/quiz/result/[result]") {
        return { file: relativeFile, pattern, route: quizResultPath(4, 5) };
      }
      const candidates = Object.entries(built.routes)
        .filter(([, entry]) => entry.srcRoute === pattern)
        .map(([route]) => route)
        .sort();
      const route =
        hint && candidates.includes(hint.route)
          ? hint.route
          : (candidates.find((route) => route.includes("/greek/")) ??
            candidates[0]);
      if (!route)
        throw new Error(
          `No generated representative for ${pattern}; rebuild or supply a verified resolver.`,
        );
      return { file: relativeFile, pattern, route };
    });
}
