import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function verifyFramework(rootPackage, webPackage, lockfile) {
  const expected = webPackage.dependencies.next;
  if (!/^\d+\.\d+\.\d+$/.test(expected)) {
    throw new Error("The web app must pin an exact Next.js release.");
  }
  if (rootPackage.pnpm?.overrides?.next !== expected) {
    throw new Error(`Next.js override must match the app's ${expected} pin.`);
  }
  const importer = lockfile
    .split(/^  apps\/web:\s*$/m)[1]
    ?.split(/^(?:\S|  \S)/m)[0];
  const dependency = importer?.match(
    /^      next:\s*\n        specifier: ['"]?([^\n'"]+)['"]?\s*\n        version: (\d+\.\d+\.\d+)/m,
  );
  if (dependency?.[1] !== expected || dependency?.[2] !== expected) {
    throw new Error(
      `The web lockfile must actually resolve Next.js ${expected}.`,
    );
  }
  return expected;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(process.argv[2] ?? ".");
  const readJson = (path) =>
    JSON.parse(readFileSync(resolve(root, path), "utf8"));
  const expected = verifyFramework(
    readJson("package.json"),
    readJson("apps/web/package.json"),
    readFileSync(resolve(root, "pnpm-lock.yaml"), "utf8"),
  );
  if (!process.argv.includes("--lockfile-only")) {
    const require = createRequire(resolve(root, "apps/web/package.json"));
    const installed = require("next/package.json").version;
    if (installed !== expected) {
      throw new Error(
        `Installed Next.js ${installed} differs from ${expected}.`,
      );
    }
  }
  console.log(`Next.js ${expected}: manifest, override and resolution agree.`);
}
