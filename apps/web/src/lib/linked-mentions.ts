import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import artifactsData from "@/data/artifacts.json";
import journeysData from "@/data/journeys.json";
import { normalizeDeityReference } from "@/lib/deities";

export type MentionKind = "story" | "artifact" | "journey" | "parallel";

export interface LinkedMention {
  kind: MentionKind;
  id: string;
  title: string;
  href: string;
  subtitle?: string;
}

interface StoryRow {
  id: string;
  slug: string;
  title: string;
  featuredDeities?: string[];
  featuredDeityIds?: string[];
  pantheonId?: string;
}

interface ArtifactRow {
  id: string;
  slug: string;
  name: string;
  owner?: string | null;
  type?: string;
}

interface JourneyRow {
  id: string;
  slug: string;
  title: string;
  heroName?: string;
  waypoints?: Array<{ deities?: string[] }>;
}

interface DeityRow {
  id: string;
  slug: string;
  name: string;
  pantheonId: string;
  crossPantheonParallels?: Array<{
    pantheonId: string;
    deityId: string;
    note?: string;
  }>;
}

const deities = deitiesData as DeityRow[];
const stories = storiesData as StoryRow[];
const artifacts = artifactsData as ArtifactRow[];
const journeys = journeysData as JourneyRow[];

const deityByNorm = new Map<string, DeityRow>();
for (const d of deities) {
  deityByNorm.set(normalizeDeityReference(d.id), d);
  deityByNorm.set(normalizeDeityReference(d.slug), d);
  deityByNorm.set(normalizeDeityReference(d.name), d);
}

function storyDeityIds(story: StoryRow): string[] {
  return [...(story.featuredDeities ?? []), ...(story.featuredDeityIds ?? [])];
}

function prettyPantheon(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Reverse-lookup: everything in the atlas that points at this deity. */
export function getLinkedMentionsForDeity(deityId: string): LinkedMention[] {
  const deity = deityByNorm.get(normalizeDeityReference(deityId));
  if (!deity) return [];

  const normId = normalizeDeityReference(deity.id);
  const nameLower = deity.name.toLowerCase();
  const mentions: LinkedMention[] = [];

  for (const story of stories) {
    const ids = storyDeityIds(story).map(normalizeDeityReference);
    if (
      ids.includes(normId) ||
      ids.includes(normalizeDeityReference(deity.slug))
    ) {
      mentions.push({
        kind: "story",
        id: story.id,
        title: story.title,
        href: `/stories/${story.slug}`,
        subtitle: story.pantheonId
          ? prettyPantheon(story.pantheonId)
          : undefined,
      });
    }
  }

  for (const artifact of artifacts) {
    if (!artifact.owner) continue;
    const ownerNorm = normalizeDeityReference(artifact.owner);
    if (
      ownerNorm === normId ||
      ownerNorm === normalizeDeityReference(deity.slug)
    ) {
      mentions.push({
        kind: "artifact",
        id: artifact.id,
        title: artifact.name,
        href: `/artifacts/${artifact.slug}`,
        subtitle: artifact.type,
      });
    }
  }

  for (const journey of journeys) {
    const inWaypoints = journey.waypoints?.some((wp) =>
      wp.deities?.some((n) => n.toLowerCase() === nameLower),
    );
    const isHero =
      journey.heroName?.toLowerCase() === nameLower ||
      normalizeDeityReference(journey.heroName ?? "") === normId;
    if (inWaypoints || isHero) {
      mentions.push({
        kind: "journey",
        id: journey.id,
        title: journey.title,
        href: `/journeys/${journey.slug}`,
        subtitle: isHero ? "Hero of the journey" : "Appears on the route",
      });
    }
  }

  for (const parallel of deity.crossPantheonParallels ?? []) {
    const other = deityByNorm.get(normalizeDeityReference(parallel.deityId));
    if (!other) continue;
    mentions.push({
      kind: "parallel",
      id: other.id,
      title: other.name,
      href: `/deities/${other.slug}`,
      subtitle: prettyPantheon(parallel.pantheonId),
    });
  }

  return mentions;
}

/** Curated syncretism chains for the homepage strip — built from real parallels. */
export function getSyncretismChains(limit = 6): Array<{
  id: string;
  label: string;
  members: Array<{ name: string; slug: string; pantheonId: string }>;
}> {
  const seeds = [
    "zeus",
    "inanna",
    "thor",
    "amaterasu",
    "quetzalcoatl",
    "oshun",
    "odin",
  ];
  const chains: Array<{
    id: string;
    label: string;
    members: Array<{ name: string; slug: string; pantheonId: string }>;
  }> = [];

  for (const seedId of seeds) {
    const seed = deityByNorm.get(normalizeDeityReference(seedId));
    if (!seed?.crossPantheonParallels?.length) continue;

    const members = [
      {
        name: seed.name,
        slug: seed.slug,
        pantheonId: seed.pantheonId,
      },
    ];

    for (const p of seed.crossPantheonParallels.slice(0, 4)) {
      const other = deityByNorm.get(normalizeDeityReference(p.deityId));
      if (!other) continue;
      if (members.some((m) => m.slug === other.slug)) continue;
      members.push({
        name: other.name,
        slug: other.slug,
        pantheonId: other.pantheonId,
      });
    }

    if (members.length < 2) continue;
    chains.push({
      id: seed.id,
      label: seed.name,
      members,
    });
    if (chains.length >= limit) break;
  }

  return chains;
}
