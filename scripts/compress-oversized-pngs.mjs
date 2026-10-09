import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const files = execSync('find apps/web/public -type f -name "*.png" -size +1M', {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

console.log(`Optimizing ${files.length} large PNGs in place...`);

let totalSaved = 0;

for (const file of files) {
  const input = readFileSync(file);
  const originalSize = input.length;
  const optimized = await sharp(input)
    .png({ quality: 85, compressionLevel: 9, effort: 7 })
    .toBuffer();

  if (optimized.length < originalSize) {
    writeFileSync(file, optimized);
    const saved = originalSize - optimized.length;
    totalSaved += saved;
    console.log(
      `${file}: ${(originalSize / 1024).toFixed(0)} KB -> ${(optimized.length / 1024).toFixed(0)} KB (saved ${(saved / 1024).toFixed(0)} KB)`,
    );
  }
}

console.log(`Total saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB`);
