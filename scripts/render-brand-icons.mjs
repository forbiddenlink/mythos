// Renders every brand icon from one mark: a mounted plate (midnight mat,
// gold tab on top, thin keyline) holding the Cinzel M of the wordmark. It is the same
// plate device the site uses for paintings, so the tab icon, the header
// mark and the cards share one shape. Flat colours only, so it stays
// legible at 16px.
//
//   node scripts/render-brand-icons.mjs   (from the repo root)
//
// Writes: src/app/icon.svg, public/{icon,favicon,logo}.svg, public/icon.png,
// public/logo.png, public/icons/icon-192x192.png,
// public/icons/icon-maskable-512x512.png, apple-icon.png (app and public),
// src/app/favicon.ico (16, 32 and 48px PNG frames).
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const MIDNIGHT = "#14162b";
const GOLD = "#d4a64a";
const LETTER = "#efd28a";

const WEB = join(process.cwd(), "apps/web");

// Cinzel Bold "M" (OFL, the wordmark's face), outline from
// src/app/fonts/cinzel-og-700.ttf in font units, y up.
const M_PATH =
  "M780 714 788 605 491 90Q491 90 481.0 72.5Q471 55 461.5 30.0Q452 5 452 -20H442L403 67ZM102 73V0H-9V10Q-8 10 -0.5 10.0Q7 10 7 10Q34 10 55.0 26.5Q76 43 80 73ZM146 57Q146 56 146.0 55.0Q146 54 146 52Q146 36 157.5 22.5Q169 9 185 9H201V0H139V57ZM163 714H172L207 614L140 0H71ZM172 714 499 177 442 -20 146 477ZM789 714 884 0H723L673 460L780 714ZM853 73H874Q879 43 900.0 26.5Q921 10 947 10Q947 10 955.0 10.0Q963 10 963 10V0H853ZM717 57H724V0H663V9H678Q695 9 706.0 22.5Q717 36 717 52Q717 54 717.0 55.0Q717 56 717 57Z";
// 28 units wide, centred in the keyline.
const M_TRANSFORM = "translate(10.26 36.5) scale(0.0288 -0.0288)";

/** Filled tile: the favicon, PWA and touch icons. */
const TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <clipPath id="tile"><rect width="48" height="48" rx="9"/></clipPath>
  <g clip-path="url(#tile)">
    <rect width="48" height="48" fill="${MIDNIGHT}"/>
    <rect width="48" height="6" fill="${GOLD}"/>
  </g>
  <rect x="4.5" y="9.5" width="39" height="34" rx="1.5" fill="none" stroke="${GOLD}" stroke-opacity="0.5"/>
  <path d="${M_PATH}" transform="${M_TRANSFORM}" fill="${LETTER}"/>
</svg>
`;

/** Line mark in one colour, for the header logo and the JSON-LD logo. */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect x="4.75" y="4.75" width="38.5" height="38.5" rx="2" fill="none" stroke="${GOLD}" stroke-width="1.5"/>
  <rect x="4" y="4" width="40" height="5" rx="1" fill="${GOLD}"/>
  <rect x="8.5" y="12.5" width="31" height="27" fill="none" stroke="${GOLD}" stroke-width="0.75" stroke-opacity="0.5"/>
  <path d="${M_PATH}" transform="${M_TRANSFORM}" fill="${GOLD}"/>
</svg>
`;

async function png(page, svg, size, { pad = 0, bg = "transparent" } = {}) {
  await page.setViewportSize({ width: size, height: size });
  const inner = size - pad * 2;
  await page.setContent(
    `<!doctype html><body style="margin:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${bg}"><div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body>`,
  );
  return page.screenshot({ omitBackground: bg === "transparent", type: "png" });
}

/** ICO container holding PNG frames (supported by every current browser). */
function ico(frames) {
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach(({ size, buf }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(buf.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([header, ...frames.map((f) => f.buf)]);
}

async function render() {
  for (const p of ["src/app/icon.svg", "public/icon.svg", "public/favicon.svg"])
    writeFileSync(join(WEB, p), TILE_SVG);
  writeFileSync(join(WEB, "public/logo.svg"), MARK_SVG);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const icon512 = await png(page, TILE_SVG, 512);
  writeFileSync(join(WEB, "public/icon.png"), icon512);
  writeFileSync(join(WEB, "public/logo.png"), icon512);
  writeFileSync(join(WEB, "public/icons/icon-192x192.png"), await png(page, TILE_SVG, 192));
  // Maskable: the platform crops to a circle or squircle inside the central
  // 80%, so the tile sits on a full-bleed midnight ground with padding.
  writeFileSync(
    join(WEB, "public/icons/icon-maskable-512x512.png"),
    await png(page, TILE_SVG, 512, { pad: 72, bg: MIDNIGHT }),
  );
  // iOS rounds the corners itself and shows transparency as black.
  const apple = await png(page, TILE_SVG, 180, { pad: 0, bg: MIDNIGHT });
  writeFileSync(join(WEB, "public/apple-icon.png"), apple);
  writeFileSync(join(WEB, "src/app/apple-icon.png"), apple);

  const frames = [];
  for (const size of [16, 32, 48]) frames.push({ size, buf: await png(page, TILE_SVG, size) });
  writeFileSync(join(WEB, "src/app/favicon.ico"), ico(frames));

  await browser.close();
  console.log("Rendered brand icons");
}

render().catch((err) => {
  console.error(err);
  process.exit(1);
});
