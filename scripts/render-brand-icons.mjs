import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SVG_CONTENT = readFileSync(join(process.cwd(), "apps/web/public/logo.svg"), "utf8");

async function render() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Render 512x512 icon.png (transparent)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px; }
          svg { width: 480px; height: 480px; }
        </style>
      </head>
      <body>
        ${SVG_CONTENT}
      </body>
    </html>
  `);
  const iconBuf = await page.screenshot({ omitBackground: true, type: "png" });
  writeFileSync(join(process.cwd(), "apps/web/public/icon.png"), iconBuf);
  writeFileSync(join(process.cwd(), "apps/web/public/logo.png"), iconBuf);
  console.log("Rendered icon.png and logo.png (512x512)");

  // 2. Render 180x180 apple-icon.png (opaque midnight ground with gold keyline, perfect for iOS home screen)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #0f1020;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 180px;
            height: 180px;
            box-sizing: border-box;
          }
          .inner-mat {
            width: 172px;
            height: 172px;
            border-radius: 36px;
            border: 1.5px solid #d4af37;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #1a1a2e 0%, #0f1020 100%);
          }
          svg { width: 130px; height: 130px; }
        </style>
      </head>
      <body>
        <div class="inner-mat">
          ${SVG_CONTENT}
        </div>
      </body>
    </html>
  `);
  const appleBuf = await page.screenshot({ omitBackground: false, type: "png" });
  writeFileSync(join(process.cwd(), "apps/web/public/apple-icon.png"), appleBuf);
  writeFileSync(join(process.cwd(), "apps/web/src/app/apple-icon.png"), appleBuf);
  console.log("Rendered apple-icon.png (180x180)");

  await browser.close();
}

render().catch(console.error);
