import { readdirSync, readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

// Use the PNG decoder shipped with our locked Playwright runner. No extra
// runtime dependency or baseline mutation is needed for failure diagnostics.
const require = createRequire(import.meta.url);
const testRequire = createRequire(
  require.resolve("@playwright/test/package.json"),
);
const playwrightRequire = createRequire(
  testRequire.resolve("playwright/package.json"),
);
const { PNG } = playwrightRequire("playwright-core/lib/utilsBundle");
const root = path.resolve(process.argv[2] ?? "visual-test-results");
const references = path.resolve("visual/__screenshots__");

function inspect(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      inspect(file);
      continue;
    }
    if (!entry.name.endsWith("-actual.png")) continue;
    const project = directory.match(
      /chromium-macos26-arm64-\d+-(?:light|dark)/,
    )?.[0];
    if (!project) continue;
    const reference = path.join(
      references,
      project,
      entry.name.replace(/-actual\.png$/, ".png"),
    );
    if (!existsSync(reference)) continue;
    const actual = PNG.sync.read(readFileSync(file));
    const expected = PNG.sync.read(readFileSync(reference));
    if (actual.width !== expected.width || actual.height !== expected.height) {
      console.log(
        JSON.stringify({
          file,
          dimensions: "changed",
          actual: [actual.width, actual.height],
          expected: [expected.width, expected.height],
        }),
      );
      continue;
    }
    let pixels = 0;
    let maximumChannelDelta = 0;
    const samples = [];
    for (let offset = 0; offset < actual.data.length; offset += 4) {
      const before = [...expected.data.subarray(offset, offset + 4)];
      const after = [...actual.data.subarray(offset, offset + 4)];
      const delta = Math.max(
        ...before.map((value, channel) => Math.abs(value - after[channel])),
      );
      if (!delta) continue;
      pixels++;
      maximumChannelDelta = Math.max(maximumChannelDelta, delta);
      if (samples.length < 20)
        samples.push({
          x: (offset / 4) % actual.width,
          y: Math.floor(offset / 4 / actual.width),
          before,
          after,
        });
    }
    console.log(
      JSON.stringify({
        file,
        reference,
        width: actual.width,
        height: actual.height,
        pixels,
        maximumChannelDelta,
        samples,
      }),
    );
  }
}

inspect(root);
