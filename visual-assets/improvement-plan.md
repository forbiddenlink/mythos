# Visual Improvement Plan: Mythos Atlas

**Art Direction:** Classical · scholarly · luminous (dark-academia atlas of antiquity).
**Zero-cost Execution:** Uses native image generation for thematic hero banners and vector-to-raster rendering for brand assets. No paid external APIs, zero credit consumption.

---

## Targeted Improvements

### Item 1: Re-render Clean Brand Icons from Approved Vector Master

- **Route / Asset:** `apps/web/public/icon.png`, `apple-icon.png`, `logo.png`, `apps/web/src/app/apple-icon.png`.
- **Placement & Consumers:** Root layout metadata (`src/app/layout.tsx:36,38`), PWA manifest (`manifest.json`), JSON-LD schema (`JsonLd.tsx:141`), browser tabs, Apple mobile bookmarking.
- **Observed Problem:** Baseline inspection revealed `icon.png` and `logo.png` contain an unaligned geometric arc artifact across the right columns from an old faulty raster export. `apple-icon.png` has dark, unmasked corners and off-center placement.
- **Action:** Replace rasters with clean exports from the approved `apps/web/public/logo.svg`.
- **Dimensions & Specs:**
  - `icon.png`: 512x512 transparent PNG, centered vector temple + astrolabe with subtle gold glow.
  - `apple-icon.png`: 180x180 opaque PNG with parchment-dark/midnight border and centered gold temple icon for crisp rendering on iOS home screens.
  - `logo.png`: 512x512 transparent PNG for brand and structured data usage.
- **Method:** Headless SVG rasterization script via Playwright / Chromium rendering the exact SVG DOM with device scale factor 2x/4x for crisp anti-aliasing. Cost: \$0.

### Item 2: Dedicated Hero for Legendary Artifacts (`/artifacts`)

- **Route / Component:** `/artifacts`, `apps/web/src/app/artifacts/page.tsx:75`.
- **Observed Problem:** Currently specifies `backgroundImage="/deities-list-hero.jpg"`. Baseline screenshot `visual-assets/baseline/desktop/artifacts-index-hero.png` shows silhouetted humanoid gods floating in deep space under the title "LEGENDARY ARTIFACTS: Weapons, shields and objects of power". It clashes directly with ancient relics and craftsmanship.
- **Action:** Create `public/artifacts-hero.webp`.
- **Proposed Asset & Intended Benefit:** Wide cinematic illustration (16:9) of ancient legendary relics (an ornate bronze/gold Aegis shield with Medusa motif, glowing runic hammer, ancient celestial astrolabe, illuminated relics on weathered stone pedestals under dramatic candlelight and twilight rays). Provides instant thematic fit and eliminates imagery reuse.
- **Mobile Behavior:** Centered crop (`object-center`), dark overlay for text contrast and readability.
- **Method:** Native image generation tool + WebP optimization. Cost: \$0.

### Item 3: Dedicated Hero for The Bestiary (`/creatures`)

- **Route / Component:** `/creatures`, `apps/web/src/app/creatures/page.tsx:57`.
- **Observed Problem:** Currently specifies `backgroundImage="/stories-hero.jpg"`. Baseline screenshot `visual-assets/baseline/desktop/creatures-index-hero.png` shows a quiet scholar's desk with an inkwell, feather quill, and rolled paper scrolls under the heading "THE BESTIARY: CREATURES & MONSTERS - Guardians, monsters and shape-shifters from the underworld to the mountain peaks." A quiet desk with paper scrolls is completely disconnected from ferocious mythological creatures.
- **Action:** Create `public/creatures-hero.webp`.
- **Proposed Asset & Intended Benefit:** Wide cinematic illustration (16:9) of an ancient mythical wilderness: rugged mist-veiled crags, carved ancient menhirs depicting mythical beasts, shadowy mythical creature silhouettes under an ethereal aurora and twilight sky in midnight and gold tones.
- **Mobile Behavior:** Centered crop with dark gradient overlay ensuring 4.5:1 text contrast.
- **Method:** Native image generation tool + WebP optimization. Cost: \$0.

### Item 4: Dedicated Hero for Legendary Heroes (`/heroes`)

- **Route / Component:** `/heroes`, `apps/web/src/app/heroes/HeroesPageClient.tsx:113`.
- **Observed Problem:** Currently specifies `backgroundImage="/hero-columns.webp"`. Baseline inspection shows bright daytime Greek architectural columns reused for a multicultural catalog covering 26 traditions (Gilgamesh, Achilles, Beowulf, Rama, Sun Wukong, Mwindo). It feels generic and overly bright.
- **Action:** Create `public/heroes-hero.webp`.
- **Proposed Asset & Intended Benefit:** Wide cinematic illustration (16:9) of a legendary quest landscape: monumental ancient stele and banners overlooking an epic mountain pass at dusk, warm bronze torches, classical and mythic adventure atmosphere adhering to the atlas palette.
- **Mobile Behavior:** Centered crop with dark midnight overlay for clear title legibility.
- **Method:** Native image generation tool + WebP optimization. Cost: \$0.

### Item 5: Dedicated Hero for Sacred Geography (`/locations`)

- **Route / Component:** `/locations`, `apps/web/src/app/locations/LocationsPageClient.tsx:410`.
- **Observed Problem:** Currently specifies `backgroundImage="/hero-columns.webp"` (reusing the same daytime Greek columns). This is a global sacred world map and geographic index.
- **Action:** Create `public/locations-hero.webp`.
- **Proposed Asset & Intended Benefit:** Wide cinematic illustration (16:9) of ancient mythical cartography and sacred mountain peaks under an illuminated celestial astrolabe dome, with compass roses, golden terrain contours, and midnight atmosphere.
- **Mobile Behavior:** Centered crop with midnight gradient scrim.
- **Method:** Native image generation tool + WebP optimization. Cost: \$0.

### Item 6: Dedicated Hero for Mythic Journeys (`/journeys`)

- **Route / Component:** `/journeys`, `apps/web/src/app/journeys/JourneysIndex.tsx:54`.
- **Observed Problem:** Currently specifies `backgroundImage="/family-tree-hero.jpg"` (reusing the celestial Yggdrasil family tree).
- **Action:** Create `public/journeys-hero.webp`.
- **Proposed Asset & Intended Benefit:** Wide cinematic illustration (16:9) of an epic mythic voyage: an ancient ship sailing beneath a celestial star map and constellation compass, evoking the Odyssey, the Argonauts, and epic quests across world folklore.
- **Mobile Behavior:** Centered crop with dark overlay.
- **Method:** Native image generation tool + WebP optimization. Cost: \$0.
