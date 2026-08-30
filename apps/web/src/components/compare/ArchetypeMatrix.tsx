"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Compass, ArrowRight } from "lucide-react";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import { getPantheonColor } from "@/lib/pantheon-colors";
import {
  compileKeywordPatterns,
  scoreArchetypeMatch,
  qualifies,
} from "@/lib/archetype-matching";
import deitiesData from "@/data/deities.json";
import pantheonsData from "@/data/pantheons.json";

interface ArchetypeDefinition {
  id: string;
  name: string;
  icon: MythosMarkId;
  tagline: string;
  description: string;
  /** Canonical domain terms (weighted highest) plus supporting motif words. */
  keywords: string[];
  protoIndoEuropeanRoot?: string;
  primaryAttributes: string[];
}

const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: "storm-sky",
    name: "Storm & Sky Sovereign",
    icon: "bolt",
    tagline: "Ruler of the celestial heights, thunder, and divine kingship",
    description:
      "The quintessential sovereign deity who commands weather, hurls lightning, enforces cosmic order, and sits atop the divine hierarchy.",
    keywords: [
      "sky",
      "thunder",
      "lightning",
      "storm",
      "storms",
      "kingship",
      "sovereignty",
      "heavens",
      "weather",
    ],
    protoIndoEuropeanRoot: "*Dyēus Ph₂tḗr ('Sky Father')",
    primaryAttributes: [
      "Thunderbolts / Lightning",
      "Eagle / Falcon",
      "Scepter / Spear",
      "Crown of the Heavens",
    ],
  },
  {
    id: "psychopomp",
    name: "Psychopomp & Guide of Souls",
    icon: "compass",
    tagline:
      "Navigator of thresholds, boundaries, and the voyage to the afterlife",
    description:
      "The liminal guide who escorts deceased souls across the great veil, delivers divine messages, and moves freely between the worlds of the living, dead, and immortal.",
    keywords: [
      "death",
      "messenger",
      "travel",
      "roads",
      "crossroads",
      "souls",
      "underworld",
      "journeys",
      "boundaries",
    ],
    primaryAttributes: [
      "Staff / Caduceus",
      "Winged sandals / Cloak",
      "Scales of Judgment",
      "Keys of the Gate",
    ],
  },
  {
    id: "sun-light",
    name: "Solar Luminary",
    icon: "torch",
    tagline:
      "Dispeller of cosmic darkness, beacon of truth, life, and prophecy",
    description:
      "The radiant solar power that voyages across the heavens daily, illuminating truth, sustaining mortal crops, and driving away primordial chaos.",
    keywords: [
      "sun",
      "light",
      "dawn",
      "prophecy",
      "radiance",
      "truth",
      "healing",
    ],
    primaryAttributes: [
      "Solar Chariot / Barque",
      "Golden Halo / Disc",
      "Bow of Golden Arrows",
      "Mirror of Radiance",
    ],
  },
  {
    id: "underworld",
    name: "Underworld Sovereign",
    icon: "urn",
    tagline:
      "Keeper of the deceased, eternal rest, and earth's subterranean riches",
    description:
      "The ruler of the subterranean realm of shadows, overseeing ancestral resting places, inexorable judgment, and mineral abundance hidden within the earth.",
    keywords: [
      "underworld",
      "death",
      "afterlife",
      "judgment",
      "shadows",
      "rebirth",
      "ancestors",
    ],
    primaryAttributes: [
      "Bident / Key of Hades",
      "Throne of Obsidian",
      "Rivers of Oblivion",
      "Helm of Invisibility",
    ],
  },
  {
    id: "trickster-fire",
    name: "Trickster & Fire-Bringer",
    icon: "serpent",
    tagline:
      "Challenger of divine rigidness, shape-shifter, and gift-giver to mortals",
    description:
      "The disruptive yet indispensable catalyst who breaks divine taboos, steals celestial fire or knowledge for humanity, and resets stagnant cosmic orders through wit.",
    keywords: [
      "fire",
      "trickery",
      "mischief",
      "transformation",
      "crafts",
      "cunning",
      "chaos",
    ],
    primaryAttributes: [
      "Stolen Fire / Torch",
      "Animal Avatar (Fox/Crow/Snake)",
      "Unraveling Knot",
      "Feather / Mask",
    ],
  },
  {
    id: "wisdom-war",
    name: "Strategic Wisdom & Just Valor",
    icon: "owl",
    tagline: "Patron of defensive strategy, craft, law, and intellect",
    description:
      "The divine mind embodying disciplined courage, tactical counsel, civilization laws, and refined handicraft, contrasting with mindless berserker fury.",
    keywords: [
      "wisdom",
      "war",
      "warfare",
      "strategy",
      "knowledge",
      "justice",
      "law",
    ],
    primaryAttributes: [
      "Aegis / Shield of Gorgon",
      "Owl of Discernment",
      "Spear of Truth",
      "Scroll of Law",
    ],
  },
  {
    id: "love-beauty",
    name: "Love, Fertility & Spring",
    icon: "myrtle",
    tagline:
      "Force of desire, procreation, flowering earth, and aesthetic splendor",
    description:
      "The irresistible cosmic attraction that drives the generation of life, springtime rebirth, emotional passion, and the blooming of nature.",
    keywords: [
      "love",
      "beauty",
      "fertility",
      "marriage",
      "spring",
      "desire",
      "motherhood",
    ],
    primaryAttributes: [
      "Dove / Swan",
      "Golden Apple / Pomegranate",
      "Girdle of Charms",
      "Sea Foam / Myrtle",
    ],
  },
  {
    id: "primal-waters",
    name: "Primal Oceans & Depths",
    icon: "trident",
    tagline:
      "Unfathomable tides, earthquakes, sea monsters, and primordial abyss",
    description:
      "The untamable power of the abyssal seas and subterranean springs, capable of nurturing continental trade or engulfing entire civilizations in cataclysmic floods.",
    keywords: [
      "sea",
      "ocean",
      "water",
      "tides",
      "earthquakes",
      "rivers",
      "floods",
    ],
    primaryAttributes: [
      "Trident / Harpoon",
      "Hippocampus / Leviathan",
      "Conch Shell",
      "Subsea Palace",
    ],
  },
];

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain: string[];
  symbols: string[];
  description: string | null;
  imageUrl?: string | null;
}

/** Deities shown per pantheon card before the roster is summarised. */
const PREVIEW_PER_PANTHEON = 3;

export function ArchetypeMatrix() {
  const [activeArchetype, setActiveArchetype] = useState<string>("storm-sky");

  const allDeities = deitiesData as Deity[];
  const allPantheons = pantheonsData as Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  const pantheonNameMap = useMemo(() => {
    return new Map(
      allPantheons.map((p) => [p.id, p.name.replace(" Pantheon", "")]),
    );
  }, [allPantheons]);

  const pantheonSlugMap = useMemo(() => {
    return new Map(allPantheons.map((p) => [p.id, p.slug]));
  }, [allPantheons]);

  const currentArchetype = useMemo(
    () => ARCHETYPES.find((a) => a.id === activeArchetype) ?? ARCHETYPES[0],
    [activeArchetype],
  );

  // Scoring lives in @/lib/archetype-matching so the ranking rules stay testable
  // and cannot silently regress to substring matching.
  const matchedDeities = useMemo(() => {
    const patterns = compileKeywordPatterns(currentArchetype.keywords);

    return allDeities
      .map((deity) => ({ deity, score: scoreArchetypeMatch(deity, patterns) }))
      .filter((entry) => qualifies(entry.score))
      .sort(
        (a, b) => b.score - a.score || a.deity.name.localeCompare(b.deity.name),
      );
  }, [allDeities, currentArchetype]);

  // Group by pantheon so users see the cross-pantheon spectrum, strongest first.
  const groupedByPantheon = useMemo(() => {
    const map = new Map<string, { deity: Deity; score: number }[]>();
    for (const entry of matchedDeities) {
      const list = map.get(entry.deity.pantheonId) ?? [];
      list.push(entry);
      map.set(entry.deity.pantheonId, list);
    }
    return [...map.entries()].sort(
      (a, b) =>
        b[1].reduce((sum, e) => sum + e.score, 0) -
          a[1].reduce((sum, e) => sum + e.score, 0) ||
        b[1].length - a[1].length,
    );
  }, [matchedDeities]);

  return (
    <div className="space-y-10">
      {/* Archetype Selector Strip */}
      <div className="flex flex-wrap gap-2.5 pb-2">
        {ARCHETYPES.map((arch) => {
          const isActive = arch.id === activeArchetype;
          return (
            <button
              key={arch.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActiveArchetype(arch.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "border border-gold bg-gold/15 text-gold shadow-sm font-semibold"
                  : "border border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-gold/40"
              }`}
            >
              <MythosMark id={arch.icon} className="size-4 shrink-0" />
              <span>{arch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Archetype Editorial Spotlight */}
      <Card className="border-gold/30 bg-card/75 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/30 pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold-text text-xs uppercase tracking-wider font-semibold mb-3">
                <MythosMark id={currentArchetype.icon} className="size-3.5" />
                Universal Motif
              </div>
              <CardTitle
                as="h2"
                className="font-serif text-3xl text-foreground"
              >
                {currentArchetype.name}
              </CardTitle>
              <CardDescription className="text-base text-parchment/80 mt-1 font-serif italic">
                {currentArchetype.tagline}
              </CardDescription>
            </div>
            {currentArchetype.protoIndoEuropeanRoot && (
              <div className="rounded-lg border border-gold/25 bg-midnight/60 px-4 py-3 text-xs text-parchment/90 shrink-0">
                <span className="text-gold block font-semibold mb-0.5">
                  Etymological Ancestry
                </span>
                <span className="font-serif text-sm">
                  {currentArchetype.protoIndoEuropeanRoot}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <p className="text-muted-foreground leading-relaxed text-base max-w-3xl">
            {currentArchetype.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground border-y border-border/60 py-3">
            <strong className="text-foreground">
              Recurring Symbolic Motifs:
            </strong>
            {currentArchetype.primaryAttributes.map((attr) => (
              <span
                key={attr}
                className="inline-flex items-center gap-1 text-gold-text font-medium"
              >
                • {attr}
              </span>
            ))}
          </div>

          {/* Cross-Pantheon Roster */}
          <div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Compass className="size-5 text-gold" />
              Manifestations Across Ancient Civilizations
              <span className="text-sm font-sans font-normal text-muted-foreground">
                {`${matchedDeities.length} ${
                  matchedDeities.length === 1 ? "deity" : "deities"
                } in ${groupedByPantheon.length} ${
                  groupedByPantheon.length === 1 ? "pantheon" : "pantheons"
                }`}
              </span>
            </h3>

            {matchedDeities.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                No deity in the atlas currently carries this motif. Try another
                archetype, or browse the{" "}
                <Link
                  href="/deities"
                  className="text-gold-text underline underline-offset-4"
                >
                  full pantheon index
                </Link>
                .
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {groupedByPantheon.map(([pantheonId, entries]) => {
                  const deities = entries.map((entry) => entry.deity);
                  const hiddenCount = deities.length - PREVIEW_PER_PANTHEON;
                  const pantheonSlug = pantheonSlugMap.get(pantheonId);
                  const pantheonLabel =
                    pantheonNameMap.get(pantheonId) ?? pantheonId;
                  const pantheonColor = getPantheonColor(pantheonId);

                  return (
                    <div
                      key={pantheonId}
                      className="rounded-xl border border-border/70 bg-card p-4 hover:border-gold/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2 mb-3">
                          <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: pantheonColor }}
                              aria-hidden
                            />
                            {pantheonLabel}
                          </h4>
                          <span className="text-[11px] text-gold/80 font-mono">
                            {deities.length}{" "}
                            {deities.length === 1 ? "figure" : "figures"}
                          </span>
                        </div>

                        <ul className="space-y-3">
                          {deities
                            .slice(0, PREVIEW_PER_PANTHEON)
                            .map((deity) => (
                              <li key={deity.id} className="group/item">
                                <Link
                                  href={`/deities/${deity.slug}`}
                                  className="flex items-start gap-3 hover:translate-x-1 transition-transform"
                                >
                                  {deity.imageUrl ? (
                                    <div className="relative size-9 rounded-md overflow-hidden shrink-0 border border-gold/20 bg-midnight">
                                      <Image
                                        src={deity.imageUrl}
                                        alt=""
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="size-9 rounded-md border border-gold/20 bg-gold/10 flex items-center justify-center font-serif text-sm text-gold shrink-0">
                                      {deity.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="font-serif text-sm font-semibold text-foreground group-hover/item:text-gold transition-colors flex items-center justify-between">
                                      <span>{deity.name}</span>
                                      <ArrowRight className="size-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-gold" />
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {deity.domain?.join(", ") ||
                                        deity.description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>

                      {hiddenCount > 0 && pantheonSlug && (
                        <Link
                          href={`/pantheons/${pantheonSlug}`}
                          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gold-text hover:text-gold transition-colors"
                        >
                          +{hiddenCount} more in this pantheon
                          <ArrowRight className="size-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
