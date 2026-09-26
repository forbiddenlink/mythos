import type { MythosMarkId } from "@/components/icons/mythos-marks";

/**
 * The primary site IA, shared by the desktop mega menu and the mobile menu.
 * Labels and descriptions are next-intl keys (`navigation.*` and
 * `navDescriptions.*`). Secondary destinations live in the footer.
 */
export interface NavItem {
  href: string;
  /** Key under `navigation`. */
  labelKey: string;
  /** Key under `navDescriptions`. */
  descriptionKey?: string;
  mark?: MythosMarkId;
}

export interface NavGroup {
  /** Key under `navigation`. */
  titleKey: string;
  items: NavItem[];
}

const ORACLE_ENABLED = process.env.NEXT_PUBLIC_ORACLE_ENABLED === "true";

export const PRIMARY_NAV: NavGroup[] = [
  {
    titleKey: "explore",
    items: [
      {
        href: "/pantheons",
        labelKey: "pantheons",
        descriptionKey: "pantheons",
        mark: "temple",
      },
      {
        href: "/deities",
        labelKey: "deities",
        descriptionKey: "deities",
        mark: "laurel",
      },
      {
        href: "/heroes",
        labelKey: "heroes",
        descriptionKey: "heroes",
        mark: "blade",
      },
      {
        href: "/stories",
        labelKey: "stories",
        descriptionKey: "stories",
        mark: "scroll",
      },
      {
        href: "/creatures",
        labelKey: "creatures",
        descriptionKey: "creatures",
        mark: "serpent",
      },
      {
        href: "/artifacts",
        labelKey: "artifacts",
        descriptionKey: "artifacts",
        mark: "relic",
      },
      {
        href: "/locations",
        labelKey: "locations",
        descriptionKey: "locations",
        mark: "peak",
      },
    ],
  },
  {
    titleKey: "visualize",
    items: [
      {
        href: "/atlas",
        labelKey: "atlas",
        descriptionKey: "atlas",
        mark: "constellation",
      },
      {
        href: "/family-tree",
        labelKey: "familyTree",
        descriptionKey: "familyTree",
        mark: "tree",
      },
      {
        href: "/knowledge-graph",
        labelKey: "knowledgeGraph",
        descriptionKey: "knowledgeGraph",
        mark: "scales",
      },
      {
        href: "/timeline",
        labelKey: "timeline",
        descriptionKey: "timeline",
        mark: "chronos",
      },
    ],
  },
  {
    titleKey: "learn",
    items: [
      {
        href: "/paths",
        labelKey: "paths",
        descriptionKey: "paths",
        mark: "compass",
      },
      { href: "/quiz", labelKey: "quiz", descriptionKey: "quiz", mark: "lyre" },
      {
        href: "/review",
        labelKey: "dailyReview",
        descriptionKey: "dailyReview",
        mark: "owl",
      },
      // The Oracle is linked only when it is switched on for this deployment.
      ...(ORACLE_ENABLED
        ? [
            {
              href: "/oracle",
              labelKey: "oracle",
              descriptionKey: "oracle",
              mark: "torch" as const,
            },
          ]
        : []),
    ],
  },
];

/** A top-level link beside the menus. */
export const PRIMARY_DIRECT_LINK: NavItem = {
  href: "/compare",
  labelKey: "compare",
};

/** Extra destinations shown only in the mobile menu's last section. */
export const MOBILE_MORE_NAV: NavGroup = {
  titleKey: "more",
  items: [
    { href: "/compare", labelKey: "compare" },
    { href: "/progress", labelKey: "yourStats" },
    { href: "/achievements", labelKey: "achievements" },
    { href: "/bookmarks", labelKey: "bookmarks" },
    { href: "/sources", labelKey: "sources" },
    { href: "/about", labelKey: "about" },
    { href: "/contact", labelKey: "contactMythosAtlas" },
    { href: "/privacy", labelKey: "privacyPolicy" },
  ],
};
