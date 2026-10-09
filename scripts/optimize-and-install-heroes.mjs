import sharp from "sharp";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const MASTERS_DIR = join(process.cwd(), "visual-assets", "masters");
mkdirSync(MASTERS_DIR, { recursive: true });

const PUBLIC_DIR = join(process.cwd(), "apps/web/public");

const ASSETS = [
  {
    name: "artifacts-hero",
    source: "/Users/elizabethstein/.gemini/antigravity/brain/0d960b8c-622b-474a-af23-74ec02d6c23e/artifacts_hero_1791560272728.jpg",
  },
  {
    name: "creatures-hero",
    source: "/Users/elizabethstein/.gemini/antigravity/brain/0d960b8c-622b-474a-af23-74ec02d6c23e/creatures_hero_1791560298540.jpg",
  },
  {
    name: "heroes-hero",
    source: "/Users/elizabethstein/.gemini/antigravity/brain/0d960b8c-622b-474a-af23-74ec02d6c23e/heroes_hero_1791560328713.jpg",
  },
  {
    name: "locations-hero",
    source: "/Users/elizabethstein/.gemini/antigravity/brain/0d960b8c-622b-474a-af23-74ec02d6c23e/locations_hero_1791560355003.jpg",
  },
  {
    name: "journeys-hero",
    source: "/Users/elizabethstein/.gemini/antigravity/brain/0d960b8c-622b-474a-af23-74ec02d6c23e/journeys_hero_1791560374797.jpg",
  },
];

async function run() {
  for (const asset of ASSETS) {
    // 1. Preserve original master
    const masterDest = join(MASTERS_DIR, `${asset.name}-master.jpg`);
    copyFileSync(asset.source, masterDest);
    console.log(`Saved master: ${masterDest}`);

    // 2. Optimize to WebP at 1920 width, 82 quality
    const webpDest = join(PUBLIC_DIR, `${asset.name}.webp`);
    await sharp(asset.source)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(webpDest);
    console.log(`Optimized WebP: ${webpDest}`);
  }
}

run().catch(console.error);
