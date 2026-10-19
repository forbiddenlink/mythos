import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { PassThrough } from "node:stream";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { verifyFramework } from "./verify-framework.mjs";

const root = { pnpm: { overrides: { next: "16.3.8" } } };
const web = { dependencies: { next: "16.3.8" } };
const lock = (version, specifier = "16.3.8") => `importers:
  .:
    dependencies: {}
  apps/web:
    dependencies:
      next:
        specifier: '${specifier}'
        version: ${version}(patch_hash=example)
      react:
        specifier: 19.2.8
        version: 19.2.8
packages:
  next@16.3.8: {}
`;

test("accepts the patched release actually resolved by the web importer", () => {
  assert.equal(verifyFramework(root, web, lock("16.3.8")), "16.3.8");
});

test("rejects a manifest-only upgrade shadowed by an older root override", () => {
  assert.throws(
    () =>
      verifyFramework(
        { pnpm: { overrides: { next: ">=16.2.11" } } },
        web,
        lock("16.3.6", ">=16.2.11"),
      ),
    /override must match/,
  );
});

test("rejects an old installed resolution even when a new package record exists", () => {
  assert.throws(
    () => verifyFramework(root, web, lock("16.3.6")),
    /actually resolve/,
  );
});

test("rejects a lockfile missing the web importer", () => {
  assert.throws(
    () => verifyFramework(root, web, "packages:\n  next@16.3.8: {}"),
    /actually resolve/,
  );
});

test("an aborted requester cannot strand a shared internal image fetch", async () => {
  const require = createRequire(resolve("apps/web/package.json"));
  const { fetchInternalImage } = require("next/dist/server/image-optimizer");
  const { serveStatic } = require("next/dist/server/serve-static");
  const socket = new PassThrough();
  socket.destroy();
  let timer;
  try {
    const image = await Promise.race([
      fetchInternalImage(
        "/deities/zeus.jpg",
        { method: "GET", socket },
        {},
        20 * 1024 * 1024,
        (req, res) =>
          serveStatic(req, res, resolve("apps/web/public/deities/zeus.jpg")),
      ),
      new Promise((_, reject) => {
        timer = setTimeout(
          () =>
            reject(
              new Error(
                "Internal image fetch stalled after requester disconnect",
              ),
            ),
          2000,
        );
      }),
    ]);
    assert.ok(image.buffer.length > 0);
    assert.match(image.contentType, /image\/jpeg/);
  } finally {
    clearTimeout(timer);
  }
});

test("bundle budgets count deployment-query chunks and deduplicate their paths", () => {
  const fixture = mkdtempSync(resolve(tmpdir(), "mythos-bundle-budget-"));
  try {
    mkdirSync(resolve(fixture, "scripts"));
    mkdirSync(resolve(fixture, ".next/static/chunks"), { recursive: true });
    const script = resolve(fixture, "scripts/check-bundle-budget.mjs");
    copyFileSync(new URL("./check-bundle-budget.mjs", import.meta.url), script);
    writeFileSync(resolve(fixture, ".next/static/chunks/root.js"), "root();");
    const writeManifests = (query) => {
      writeFileSync(
        resolve(fixture, ".next/build-manifest.json"),
        JSON.stringify({ rootMainFiles: [`static/chunks/root.js${query}`] }),
      );
      for (const route of ["", "deities/[slug]", "stories/[slug]", "atlas"]) {
        const directory = resolve(fixture, ".next/server/app", route);
        mkdirSync(directory, { recursive: true });
        const manifest = {
          clientModules: {
            client: {
              chunks: [
                "123",
                `static/chunks/route.js${query}`,
                `static/chunks/route.js${query ? "?dpl=another-deployment" : ""}`,
                "static/chunks/root.js",
              ],
            },
          },
        };
        writeFileSync(
          resolve(directory, "page_client-reference-manifest.js"),
          `globalThis.__RSC_MANIFEST = ${JSON.stringify({
            [route ? `/${route}/page` : "/page"]: manifest,
          })};`,
        );
      }
    };
    writeManifests("?dpl=test-deployment");
    assert.throws(
      () => execFileSync(process.execPath, [script], { stdio: "pipe" }),
      (error) =>
        /chunk static\/chunks\/route.js listed but missing/.test(
          error.stderr.toString(),
        ),
    );
    writeFileSync(resolve(fixture, ".next/static/chunks/route.js"), "route();");
    const withDeployment = execFileSync(process.execPath, [script], {
      encoding: "utf8",
    });
    writeManifests("");
    const withoutDeployment = execFileSync(process.execPath, [script], {
      encoding: "utf8",
    });
    assert.equal(withDeployment, withoutDeployment);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});
