import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card for entry, comparison, domain and guide pages.
 *
 * Satori (next/og) cannot read CSS custom properties, so the brand palette is
 * restated here as literal colours: midnight grounds, parchment text and a
 * gold accent, tinted per tradition the same way the deity and story cards are.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const PARCHMENT = "#f5f0e1";
const GOLD = "#d4af37";
const MIDNIGHT = "#0f1020";

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

/** Palette for a pantheon id ("greek-pantheon" or "greek"); gold on midnight otherwise. */
export function ogPalette(pantheonId?: string | null): OgPalette {
  const key = (pantheonId ?? "").replace(/-pantheon$/, "");
  return PANTHEON_PALETTE[key] ?? { bg: "#1a1a2e", accent: GOLD };
}

interface OgCardInput {
  /** Small caps line above the title: "Greek creature", "Guide". */
  eyebrow: string;
  title: string;
  /** Accent line under the title (domains, "vs", a subtitle). */
  subtitle?: string;
  description?: string;
  palette?: OgPalette;
}

function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

export function renderOgCard({
  eyebrow,
  title,
  subtitle,
  description,
  palette = ogPalette(null),
}: OgCardInput): ImageResponse {
  const { bg, accent } = palette;
  const titleSize = title.length > 34 ? 56 : title.length > 22 ? 64 : 76;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: bg,
        backgroundImage: `linear-gradient(135deg, ${bg} 0%, ${MIDNIGHT} 55%, ${accent}26 100%)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          border: `2px solid ${accent}55`,
          borderRadius: 12,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 24px",
            border: `1px solid ${accent}88`,
            borderRadius: 999,
            color: accent,
            fontSize: 20,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          {clip(eyebrow, 48)}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            color: PARCHMENT,
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {clip(title, 64)}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: accent,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            {clip(subtitle, 80)}
          </div>
        ) : null}
        {description ? (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: `${PARCHMENT}bb`,
              maxWidth: 900,
              textAlign: "center",
              lineHeight: 1.45,
            }}
          >
            {clip(description, 170)}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "18px 60px 34px",
          fontSize: 20,
          letterSpacing: "0.2em",
          color: `${PARCHMENT}88`,
        }}
      >
        MYTHOS ATLAS
      </div>
    </div>,
    { ...OG_SIZE },
  );
}
