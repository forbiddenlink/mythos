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
