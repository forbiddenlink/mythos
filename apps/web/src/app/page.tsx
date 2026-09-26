import { CollectionsShowcase } from "@/components/home/CollectionsShowcase";
import { CTASection } from "@/components/home/CTASection";
import { DidYouKnow } from "@/components/home/DidYouKnow";
import { AtlasOpensHero } from "@/components/home/AtlasOpensHero";
import { InteractiveStoriesBanner } from "@/components/home/InteractiveStoriesBanner";
import { PantheonShowcase } from "@/components/home/PantheonShowcase";
import { SyncretismStrip } from "@/components/mythology/SyncretismStrip";
import { generateBaseMetadata } from "@/lib/metadata";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import pantheonsData from "@/data/pantheons.json";
import creaturesData from "@/data/creatures.json";
import artifactsData from "@/data/artifacts.json";
import locationsData from "@/data/locations.json";

// Computed on the server (this is a Server Component). Importing the source
// JSON here keeps it OUT of the client bundle — only the small derived values below
// serialize to the client components as props.
const HERO_COUNTS = {
  pantheons: (pantheonsData as unknown[]).length,
  deities: (deitiesData as unknown[]).length,
  stories: (storiesData as unknown[]).length,
  creatures: (creaturesData as unknown[]).length,
  artifacts: (artifactsData as unknown[]).length,
  locations: (locationsData as unknown[]).length,
} as const;

// Slim id/slug -> {name, slug} lookup for DidYouKnow's related-deity chips, so the
// full 492 KB deities.json no longer ships to the browser. Keyed by BOTH id and
// slug because fact.relatedDeities entries can be either.
const DEITY_LOOKUP: Record<string, { name: string; slug: string }> = {};
for (const d of deitiesData as { id: string; slug: string; name: string }[]) {
  const entry = { name: d.name, slug: d.slug };
  DEITY_LOOKUP[d.id] = entry;
  DEITY_LOOKUP[d.slug] = entry;
}

export const metadata = generateBaseMetadata({
  title: "Mythos Atlas - Explore World Mythology",
  description:
    "Explore gods, myths, and legendary worlds from 19 civilizations with family trees, quizzes, stories, and interactive mythology tools.",
  url: "/",
  keywords: [
    "mythology",
    "Greek gods",
    "Norse mythology",
    "Egyptian deities",
    "pantheons",
    "family tree",
    "comparative mythology",
    "Elizabeth Stein",
  ],
});

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Preload the hero background so it stops being a ~8s LCP (CSS bg images
          are discovered late + fetched at low priority otherwise). */}
      <link
        rel="preload"
        as="image"
        href="/hero-columns.webp"
        fetchPriority="high"
      />
      <AtlasOpensHero counts={HERO_COUNTS} />
      <PantheonShowcase />
      <CollectionsShowcase />
      <SyncretismStrip />
      <InteractiveStoriesBanner />
      <DidYouKnow deityLookup={DEITY_LOOKUP} />
      <CTASection />
    </div>
  );
}
