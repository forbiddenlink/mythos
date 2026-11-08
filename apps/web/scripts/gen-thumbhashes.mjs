// Generates src/data/thumbhashes.json: public path -> base64 ThumbHash for every
// local raster image under public/. Re-run after adding or replacing images:
//   pnpm --filter web gen:thumbhashes
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const outFile = path.join(root, "src/data/thumbhashes.json");
const RASTER = /\.(jpe?g|png|webp|avif)$/i;
// App icons are never rendered through next/image grids.
const SKIP_DIRS = new Set(["icons", "audio"]);
const SKIP_FILES = new Set(["apple-icon.png", "icon.png", "logo.png"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === publicDir && SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (RASTER.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      yield full;
    }
  }
}

async function hashOf(file) {
  const { data, info } = await sharp(file)
    .resize(100, 100, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Buffer.from(rgbaToThumbHash(info.width, info.height, data)).toString(
    "base64",
  );
}

const files = [];
for await (const file of walk(publicDir)) files.push(file);
files.sort();

const map = {};
let failed = 0;
for (const file of files) {
  const key = `/${path.relative(publicDir, file).split(path.sep).join("/")}`;
  try {
    map[key] = await hashOf(file);
  } catch (error) {
    failed += 1;
    console.error(`skip ${key}: ${error.message}`);
  }
}

await writeFile(outFile, `${JSON.stringify(map)}\n`);
console.log(
  `wrote ${Object.keys(map).length} hashes (${failed} failed) to ${path.relative(root, outFile)}`,
);
if (failed > 0) process.exitCode = 1;
