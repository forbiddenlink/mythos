/**
 * Shared pantheon accent colors — used for card gradients and highlights.
 * Culturally informed: hues drawn from each tradition's material culture,
 * calibrated for legibility against the dark (#07060f) base.
 */
export const PANTHEON_COLORS: Record<string, string> = {
  "greek-pantheon": "#c9a84c", // warm Aegean gold (marble, olive)
  "norse-pantheon": "#4a6fa5", // slate blue-grey (fjord, iron)
  "egyptian-pantheon": "#b5820e", // amber-ochre (sandstone, papyrus)
  "roman-pantheon": "#9b3b2f", // terracotta red (brick, legionary)
  "hindu-pantheon": "#c5671a", // saffron-orange (marigold, ceremony)
  "japanese-pantheon": "#8b1a1a", // lacquer red (torii, urushi)
  "celtic-pantheon": "#2d6a4f", // forest green (oak, mist)
  "aztec-pantheon": "#7a2b1a", // deep terracotta (clay, obsidian)
  "chinese-pantheon": "#8b1428", // crimson (lacquer, silk)
  "mesopotamian-pantheon": "#7a5c1a", // amber clay (cuneiform tablet)
  "african-pantheon": "#7a4a1a", // earth ochre (Benin bronze, laterite)
  "yoruba-pantheon": "#8a5a1e", // indigo-dyed adire brown-gold (Ife bronze, laterite)
  "akan-pantheon": "#9a7418", // kente gold (Asante gold weights, kente)
  "polynesian-pantheon": "#0b6e7a", // deep Pacific teal (ocean, basalt)
  "mesoamerican-pantheon": "#2d5a1a", // jade green (ceiba, quetzal)
  "slavic-pantheon": "#4a5d3a", // oak-forest olive green with a rust undertone (Perun's oak, iron)
  "haudenosaunee-pantheon": "#1f5c47", // white pine spruce-green (the Tree of Peace)
  "tlingit-haida-pantheon": "#a8442c", // formline ochre-red (Northwest Coast red paint, cedar bark)
  "hittite-pantheon": "#7a4a2a", // baked-clay terracotta (Hattusa tablets and mudbrick)
  "canaanite-pantheon": "#6b2d5c", // Tyrian purple (murex dye of the Levantine coast)
  "inuit-pantheon": "#3d6f8e", // sea-ice blue (open water at the floe edge)
  "aboriginal-australian-pantheon": "#8f4a2c", // inland earth red (landscape tone, not a ceremonial pigment reference)
  "dine-pantheon": "#2c7a7b", // turquoise
  "inca-pantheon": "#a3294f", // cochineal carmine (the red dye of Inca tapestry cloth, qompi)
  "persian-pantheon": "#2c4a9a", // lapis lazuli (Achaemenid glazed brick, Sasanian and Persian manuscript blue)
  "finnish-pantheon": "#5e5a8c", // twilight violet (the polar-night kaamos sky over lakes and birch)
  "korean-pantheon": "#5f8f7e", // celadon (the jade-green glaze of Goryeo stoneware)
};

export function getPantheonColor(pantheonId: string): string {
  return PANTHEON_COLORS[pantheonId] || "#6b7280";
}

/**
 * Pantheon accent pairs (primary + darker secondary shade) + display label,
 * shared source for the map/journey/timeline visuals below.
 * Calibrated with culturally grounded pigments rather than generic saturated hues.
 */
interface PantheonAccent {
  primary: string;
  secondary: string;
  label: string;
}

const PANTHEON_ACCENTS: Record<string, PantheonAccent> = {
  "greek-pantheon": {
    primary: "#c9a84c",
    secondary: "#9e7e2c",
    label: "Greek",
  },
  "norse-pantheon": {
    primary: "#5d82b0",
    secondary: "#3d5f8a",
    label: "Norse",
  },
  "egyptian-pantheon": {
    primary: "#c99218",
    secondary: "#9e6f0b",
    label: "Egyptian",
  },
  "roman-pantheon": {
    primary: "#a83e32",
    secondary: "#7e281e",
    label: "Roman",
  },
  "hindu-pantheon": {
    primary: "#d46f1a",
    secondary: "#a8500c",
    label: "Hindu",
  },
  "japanese-pantheon": {
    primary: "#a82424",
    secondary: "#7d1414",
    label: "Japanese",
  },
  "celtic-pantheon": {
    primary: "#3a785b",
    secondary: "#25543e",
    label: "Celtic",
  },
  "aztec-pantheon": {
    primary: "#8c3b28",
    secondary: "#662516",
    label: "Aztec",
  },
  "chinese-pantheon": {
    primary: "#a81932",
    secondary: "#7d0c20",
    label: "Chinese",
  },
  "mesopotamian-pantheon": {
    primary: "#8c6922",
    secondary: "#664911",
    label: "Mesopotamian",
  },
  "african-pantheon": {
    primary: "#8c5722",
    secondary: "#663b11",
    label: "African",
  },
  "yoruba-pantheon": {
    primary: "#9a6428",
    secondary: "#6e4416",
    label: "Yoruba",
  },
  "akan-pantheon": {
    primary: "#a8821e",
    secondary: "#765a10",
    label: "Akan",
  },
  "polynesian-pantheon": {
    primary: "#137e8c",
    secondary: "#0a5863",
    label: "Polynesian",
  },
  "mesoamerican-pantheon": {
    primary: "#3d7026",
    secondary: "#274d15",
    label: "Mesoamerican",
  },
  "slavic-pantheon": {
    primary: "#586e45",
    secondary: "#3c4f2d",
    label: "Slavic",
  },
  "haudenosaunee-pantheon": {
    primary: "#266b53",
    secondary: "#164736",
    label: "Haudenosaunee",
  },
  "tlingit-haida-pantheon": {
    primary: "#b54a32",
    secondary: "#326b66",
    label: "Tlingit & Haida",
  },
  "hittite-pantheon": {
    primary: "#b8703f",
    secondary: "#6f7f5a",
    label: "Hittite",
  },
  "canaanite-pantheon": {
    primary: "#9b4a86",
    secondary: "#c28a3a",
    label: "Canaanite",
  },
  "inuit-pantheon": {
    primary: "#5b9bc4",
    secondary: "#9aa7b0",
    label: "Inuit",
  },
  "aboriginal-australian-pantheon": {
    primary: "#b8683f",
    secondary: "#5f7f6a",
    label: "Aboriginal Australian",
  },
  "dine-pantheon": {
    primary: "#3fa3a0",
    secondary: "#b08a4a",
    label: "Diné",
  },
  "inca-pantheon": {
    primary: "#b83a5c",
    secondary: "#8a2340",
    label: "Inca & Andean",
  },
  "persian-pantheon": {
    primary: "#3b5bb0",
    secondary: "#233c7a",
    label: "Persian",
  },
  "finnish-pantheon": {
    primary: "#6f6aa3",
    secondary: "#4a467a",
    label: "Finnish",
  },
  "korean-pantheon": {
    primary: "#6fa391",
    secondary: "#487565",
    label: "Korean",
  },
};

/** {primary,secondary} shape — components/maps/JourneyMap.tsx */
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
