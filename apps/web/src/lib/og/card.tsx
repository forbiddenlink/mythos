import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/metadata";
import { PANTHEON_COLORS } from "@/lib/pantheon-colors";

/**
 * Shared Open Graph card for entry, comparison, domain and guide pages.
 *
 * Satori (next/og) cannot read CSS custom properties, so the brand palette is
 * restated here as literal colours: midnight grounds, parchment text and a
 * gold accent, tinted per tradition the same way the deity and story cards are.
 */

// Satori renders only fonts passed in explicitly; a CSS font-family name alone
// falls back to its default sans. Static 700-weight instance of the site's
// Cinzel (OFL), read on first use and cached per server process. Node runtime only.
// Read lazily, not at import: Next bundles metadata-image modules into ordinary
// page bundles, so a read at module load crashed whole pages (/changelog) when the
// file was missing from a function, not just the OG route.
let cinzel700: Buffer | undefined;
function cinzelFont(): Buffer {
  cinzel700 ??= readFileSync(
    join(process.cwd(), "src/app/fonts/cinzel-og-700.ttf"),
  );
  return cinzel700;
}

// Crimson Pro 400 (OFL, latin subset as WOFF; Satori cannot read WOFF2) for
// the description, so reading text is never set in Cinzel's all-caps forms.
let crimson400: Buffer | undefined;
function crimsonFont(): Buffer {
  crimson400 ??= readFileSync(
    join(process.cwd(), "src/app/fonts/crimson-pro-og-400.woff"),
  );
  return crimson400;
}

export const OG_SIZE = { width: 1200, height: 630 } as const;

const PARCHMENT = "#f5f0e1";
const GOLD = "#d4af37";
const MIDNIGHT = "#14162b";
const MAT = "#f3ecdc";

interface OgPalette {
  bg: string;
  accent: string;
}

const PANTHEON_PALETTE: Record<string, OgPalette> = {
  greek: { bg: "#1a1a2e", accent: GOLD },
  norse: { bg: "#1a2332", accent: "#7cb9e8" },
  egyptian: { bg: "#2d1f14", accent: "#c9a227" },
  roman: { bg: "#2a1a1a", accent: "#c8553d" },
  celtic: { bg: "#1a2e1a", accent: "#5fae5f" },
  hindu: { bg: "#2e1a2e", accent: "#ff8a4c" },
  japanese: { bg: "#1a1a2e", accent: "#e0455f" },
  mesopotamian: { bg: "#2e2a1a", accent: "#cd853f" },
  chinese: { bg: "#2e1a1a", accent: "#ff6a3d" },
  mesoamerican: { bg: "#1a2e2a", accent: "#2fc6c9" },
  aztec: { bg: "#1a2e2a", accent: "#2fc6c9" },
  african: { bg: "#2e2e1a", accent: "#ffd700" },
  yoruba: { bg: "#2e241a", accent: "#e0a040" },
  akan: { bg: "#2e2a14", accent: "#f2c230" },
  polynesian: { bg: "#1a2e2e", accent: "#20b2aa" },
  slavic: { bg: "#1c1a2e", accent: "#9fa8da" },
};

/**
 * Palette for a pantheon id ("greek-pantheon" or "greek"). Traditions without a
 * tuned pair keep the midnight ground with their shared accent colour.
 */
export function ogPalette(pantheonId?: string | null): OgPalette {
  const key = (pantheonId ?? "").replace(/-pantheon$/, "");
  const accent = pantheonId ? PANTHEON_COLORS[pantheonId] : undefined;
  return PANTHEON_PALETTE[key] ?? { bg: "#1a1a2e", accent: accent ?? GOLD };
}

interface OgCardInput {
  /** Small caps line above the title: "Greek creature", "Guide". */
  eyebrow: string;
  title: string;
  /** Accent line under the title (domains, "vs", a subtitle). */
  subtitle?: string;
  description?: string;
  palette?: OgPalette;
  /** The entry's picture, a site path ("/deities/zeus.jpg"), mounted as a plate. */
  image?: string | null;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/**
 * The picture as a data URI, fetched from the site itself: OG routes render
 * per request, and the image folders are far too large to ship inside the
 * function. Any failure (timeout, protected preview, unsupported format)
 * returns null and the card is drawn without a plate.
 */
async function loadImage(path: string): Promise<string | null> {
  const origin =
    process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT ?? 3000}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : siteConfig.url;
  // Site paths go through the image optimizer, which resizes the picture and
  // answers a JPEG-only Accept header with JPEG even for WebP sources (Satori
  // cannot decode WebP). 750 and 75 are a configured width and quality.
  const url = path.startsWith("/")
    ? new URL(`/_next/image?url=${encodeURIComponent(path)}&w=750&q=75`, origin)
    : new URL(path);
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/jpeg" },
      signal: AbortSignal.timeout(6000),
    });
    const type = res.headers.get("content-type") ?? "";
    // Satori decodes PNG and JPEG; anything else falls back to text only.
    if (!res.ok || !/^image\/(png|jpe?g)/.test(type)) return null;
    const data = Buffer.from(await res.arrayBuffer()).toString("base64");
    return `data:${type};base64,${data}`;
  } catch {
    return null;
  }
}

/**
 * A title page: running head, the name in Cinzel, the lede in Crimson Pro,
 * and the entry's picture mounted as a plate with a tab in the tradition
 * colour. Flat midnight ground, no glow.
 */
export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
  description,
  palette = ogPalette(null),
  image,
}: OgCardInput): Promise<ImageResponse> {
  const { accent } = palette;
  const picture = image ? await loadImage(image) : null;
  const titleSize =
    title.length > 34 ? 54 : title.length > 22 ? 64 : picture ? 80 : 88;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: MIDNIGHT,
        padding: "56px 72px",
        fontFamily: "Crimson Pro, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingRight: picture ? 56 : 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `3px solid ${GOLD}99`,
            borderBottom: `1px solid ${GOLD}55`,
            padding: "12px 0",
            fontFamily: "Cinzel, serif",
            fontSize: 18,
            letterSpacing: "0.22em",
          }}
        >
          <span style={{ color: GOLD }}>MYTHOS ATLAS</span>
          {/* Fallback cards pass the brand as the eyebrow; print it once. */}
          {eyebrow.toLowerCase() === siteConfig.name.toLowerCase() ? null : (
            <span style={{ color: `${PARCHMENT}aa` }}>
              {clip(eyebrow, 40).toUpperCase()}
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Cinzel, serif",
              fontSize: titleSize,
              fontWeight: 700,
              color: PARCHMENT,
              lineHeight: 1.05,
            }}
          >
            {clip(title, 64)}
          </div>
          {subtitle ? (
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontFamily: "Cinzel, serif",
                fontSize: 22,
                letterSpacing: "0.08em",
                color: accent,
              }}
            >
              {clip(subtitle, picture ? 56 : 80)}
            </div>
          ) : null}
          {description ? (
            <div
              style={{
                display: "flex",
                marginTop: 26,
                fontSize: 30,
                lineHeight: 1.32,
                color: `${PARCHMENT}d0`,
              }}
            >
              {clip(description, picture ? 128 : 190)}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            color: `${PARCHMENT}88`,
          }}
        >
          <span
            style={{
              width: 28,
              height: 4,
              backgroundColor: accent,
              marginRight: 14,
            }}
          />
          mythosatlas.com
        </div>
      </div>
      {picture ? (
        <div
          style={{
            display: "flex",
            width: 384,
            height: 518,
            padding: 12,
            backgroundColor: MAT,
            borderTop: `6px solid ${accent}`,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              border: `1px solid ${GOLD}aa`,
              padding: 6,
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: Satori renders plain img */}
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain img */}
            <img
              src={picture}
              alt=""
              width={346}
              height={474}
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
          </div>
        </div>
      ) : null}
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Cinzel", data: cinzelFont(), weight: 700, style: "normal" },
        {
          name: "Crimson Pro",
          data: crimsonFont(),
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
