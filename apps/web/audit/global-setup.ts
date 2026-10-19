import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { currentRoutes, evidenceRoot } from "./routes";

/** Coordinator-only reset: preserve unrelated performance/browser evidence. */
export default function globalSetup(): void {
  mkdirSync(evidenceRoot, { recursive: true });
  const ownedReports = new Set(
    currentRoutes().flatMap((entry) =>
      [320, 768, 1440].flatMap((width) =>
        ["light", "dark"].flatMap((theme) =>
          ["json", "png"].map(
            (extension) =>
              `${entry.pattern.replace(/[^a-z0-9-]/gi, "_") || "home"}-${width}-${theme}.${extension}`,
          ),
        ),
      ),
    ),
  );
  for (const name of readdirSync(evidenceRoot)) {
    if (/^\.failure-shot-\d+$/.test(name) || ownedReports.has(name)) {
      rmSync(path.join(evidenceRoot, name), { force: true });
    }
  }
}
