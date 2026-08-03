/** Shared pantheon accent colors — keep free of heavy graph deps. */
export const PANTHEON_COLORS: Record<string, string> = {
  "greek-pantheon": "#3b82f6",
  "norse-pantheon": "#10b981",
  "egyptian-pantheon": "#f59e0b",
  "roman-pantheon": "#ef4444",
  "hindu-pantheon": "#8b5cf6",
  "japanese-pantheon": "#ec4899",
  "celtic-pantheon": "#14b8a6",
  "aztec-pantheon": "#f97316",
  "chinese-pantheon": "#eab308",
  "mesopotamian-pantheon": "#a16207",
  "african-pantheon": "#7c3aed",
  "polynesian-pantheon": "#06b6d4",
  "mesoamerican-pantheon": "#65a30d",
};

export function getPantheonColor(pantheonId: string): string {
  return PANTHEON_COLORS[pantheonId] || "#6b7280";
}

/**
 * Pantheon accent pairs (primary + darker secondary shade) + display label,
 * shared source for the map/journey/timeline visuals below. Distinct from
 * PANTHEON_COLORS above (different palette, different consumers).
 */
interface PantheonAccent {
  primary: string;
  secondary: string;
  label: string;
}

const PANTHEON_ACCENTS: Record<string, PantheonAccent> = {
  "greek-pantheon": {
    primary: "#3b82f6",
    secondary: "#2563eb",
    label: "Greek",
  },
  "norse-pantheon": {
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    label: "Norse",
  },
  "egyptian-pantheon": {
    primary: "#f59e0b",
    secondary: "#d97706",
    label: "Egyptian",
  },
  "roman-pantheon": {
    primary: "#ef4444",
    secondary: "#dc2626",
    label: "Roman",
  },
  "hindu-pantheon": {
    primary: "#f97316",
    secondary: "#ea580c",
    label: "Hindu",
  },
  "japanese-pantheon": {
    primary: "#ec4899",
    secondary: "#db2777",
    label: "Japanese",
  },
  "celtic-pantheon": {
    primary: "#22c55e",
    secondary: "#16a34a",
    label: "Celtic",
  },
  "aztec-pantheon": {
    primary: "#14b8a6",
    secondary: "#0d9488",
    label: "Aztec",
  },
  "chinese-pantheon": {
    primary: "#e11d48",
    secondary: "#be123c",
    label: "Chinese",
  },
  "mesopotamian-pantheon": {
    primary: "#a16207",
    secondary: "#854d0e",
    label: "Mesopotamian",
  },
  "african-pantheon": {
    primary: "#7c3aed",
    secondary: "#6d28d9",
    label: "African",
  },
  "polynesian-pantheon": {
    primary: "#06b6d4",
    secondary: "#0891b2",
    label: "Polynesian",
  },
  "mesoamerican-pantheon": {
    primary: "#65a30d",
    secondary: "#4d7c0f",
    label: "Mesoamerican",
  },
};

/** {bg,label} shape — locations/page.tsx, journeys/page.tsx, journeys/[slug]/JourneyPageClient.tsx */
export const PANTHEON_BG_LABEL: Record<string, { bg: string; label: string }> =
  Object.fromEntries(
    Object.entries(PANTHEON_ACCENTS).map(([id, a]) => [
      id,
      { bg: a.primary, label: a.label },
    ]),
  );

/** {primary,secondary} shape — components/maps/JourneyMap.tsx, JourneyPreviewMap.tsx */
export const PANTHEON_PRIMARY_SECONDARY: Record<
  string,
  { primary: string; secondary: string }
> = Object.fromEntries(
  Object.entries(PANTHEON_ACCENTS).map(([id, a]) => [
    id,
    { primary: a.primary, secondary: a.secondary },
  ]),
);

/** {bg,border,label} shape — components/locations/MapVisualization.tsx */
export const PANTHEON_BG_BORDER_LABEL: Record<
  string,
  { bg: string; border: string; label: string }
> = Object.fromEntries(
  Object.entries(PANTHEON_ACCENTS).map(([id, a]) => [
    id,
    { bg: a.primary, border: a.secondary, label: a.label },
  ]),
);

/** plain hex — components/timeline/TimelineVisualizationD3.tsx */
export const PANTHEON_HEX: Record<string, string> = Object.fromEntries(
  Object.entries(PANTHEON_ACCENTS).map(([id, a]) => [id, a.primary]),
);
