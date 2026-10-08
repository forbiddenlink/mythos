import { afterEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import adapter from "../../../scripts/csp-adapter.mjs";
import { generateCspManifest, sha256 } from "../../../scripts/csp-hashes.mjs";

const fixtures: string[] = [];

function fixture(scoped: boolean) {
  const projectDir = mkdtempSync(path.join(tmpdir(), "mythos-csp-"));
  fixtures.push(projectDir);
  const distDir = path.join(projectDir, ".next");
  mkdirSync(path.join(projectDir, "public"), { recursive: true });
  mkdirSync(distDir, { recursive: true });
  writeFileSync(path.join(projectDir, "package.json"), "{}");
  writeFileSync(path.join(distDir, "BUILD_ID"), "new-build");
  const appPaths = { "/page": "/", "/deities/[slug]/page": "/deities/[slug]" };
  writeFileSync(
    path.join(distDir, "app-path-routes-manifest.json"),
    JSON.stringify(appPaths),
  );
  writeFileSync(
    path.join(distDir, "prerender-manifest.json"),
    JSON.stringify({
      routes: {
        "/": { routeType: "page", srcRoute: null },
        "/deities/zeus": { routeType: "page", srcRoute: "/deities/[slug]" },
      },
    }),
  );
  const prerenders = Object.entries(appPaths).map(([module, source], index) => {
    const pathname = index === 0 ? "/" : "/deities/zeus";
    const rel = pathname === "/" ? "/index" : pathname;
    const owner = createHash("sha256").update(module).digest("hex");
    const filePath = scoped
      ? path.join(distDir, "server/route-cache/APP_PAGE", owner, `$${rel}.html`)
      : path.join(distDir, "server/app", `${rel}.html`);
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(
      filePath,
      `<script>common()</script><script>${source === "/" ? "home()" : "zeus()"}</script>`,
    );
    return { pathname, fallback: { filePath } };
  });
  return {
    projectDir,
    distDir,
    outputs: { prerenders, staticFiles: [] },
    config: {},
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  for (const directory of fixtures.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe("CSP build lifecycle", () => {
  it.each([false, true])(
    "hashes classic and source-scoped prerenders (scoped=%s)",
    (scoped) => {
      const context = fixture(scoped);
      // Post-build invocation has no adapter output context.
      const manifest = generateCspManifest({
        projectDir: context.projectDir,
        distDir: context.distDir,
      });
      expect(manifest).toEqual({
        version: 1,
        buildId: "new-build",
        common: [sha256("common()")],
        routes: {
          "/": [sha256("home()")],
          "/deities/zeus": [sha256("zeus()")],
        },
      });
      expect(generateCspManifest(context)).toEqual(manifest);
      expect(
        JSON.parse(
          readFileSync(
            path.join(context.projectDir, "public/csp-manifest.json"),
            "utf8",
          ),
        ),
      ).toEqual(manifest);
    },
  );

  it("delegates native configuration and packages fresh hashes before its build hook", () => {
    const context = fixture(true);
    const nativePath = path.join(context.projectDir, "native.mjs");
    writeFileSync(
      nativePath,
      `import { copyFileSync, readFileSync } from 'node:fs';
      import path from 'node:path';
      export default {
        async modifyConfig(config) { return { ...config, nativeMarker: true, adapterPath: 'native' }; },
        async onBuildComplete(context) {
          const output = context.outputs.staticFiles.find(file => file.pathname === '/csp-manifest.json');
          if (!output || output.type !== 'STATIC_FILE') throw new Error('manifest missing from adapter outputs');
          const manifest = JSON.parse(readFileSync(output.filePath, 'utf8'));
          if (manifest.buildId !== 'new-build') throw new Error('stale manifest');
          copyFileSync(output.filePath, path.join(context.projectDir, 'packaged-manifest.json'));
        }
      };`,
    );
    vi.stubEnv("NEXT_ADAPTER_PATH", nativePath);
    expect(
      existsSync(path.join(context.projectDir, "public/csp-manifest.json")),
    ).toBe(false);
    // Use Node's real loader: the native platform adapter lives outside the
    // application's module graph and must not be imported through Vitest/Vite.
    const wrapperUrl = pathToFileURL(
      path.resolve("scripts/csp-adapter.mjs"),
    ).href;
    const scriptUrl = pathToFileURL(
      path.resolve("scripts/csp-hashes.mjs"),
    ).href;
    const output = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
      import adapter from ${JSON.stringify(wrapperUrl)};
      import { generateCspManifest } from ${JSON.stringify(scriptUrl)};
      const context = ${JSON.stringify(context)};
      const modified = await adapter.modifyConfig({ experimental: {} }, { projectDir: context.projectDir });
      await adapter.onBuildComplete(context);
      generateCspManifest({ projectDir: context.projectDir, distDir: context.distDir });
      await adapter.onBuildComplete(context);
      console.log(JSON.stringify({ marker: modified.nativeMarker, path: modified.adapterPath, outputs: context.outputs.staticFiles }));
    `,
      ],
      { encoding: "utf8" },
    );
    const result = JSON.parse(output.trim().split("\n").at(-1)!);
    expect(result.marker).toBe(true);
    expect(result.path).toMatch(/scripts\/csp-adapter\.mjs$/);
    expect(result.outputs).toHaveLength(1);
    const packaged = readFileSync(
      path.join(context.projectDir, "packaged-manifest.json"),
      "utf8",
    );
    expect(packaged).toBe(
      readFileSync(path.join(context.distDir, "csp-manifest.json"), "utf8"),
    );
  });

  it("refuses a recursive native adapter path", async () => {
    const context = fixture(false);
    vi.stubEnv("NEXT_ADAPTER_PATH", path.resolve("scripts/csp-adapter.mjs"));
    await expect(
      adapter.modifyConfig({}, { projectDir: context.projectDir }),
    ).rejects.toThrow("recursive");
  });
});
