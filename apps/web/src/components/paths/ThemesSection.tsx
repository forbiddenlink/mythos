import { EntityCard, EntityGrid } from "@/components/entities/EntityCard";
import { getPantheonShortNames } from "@/lib/data/catalog";
import { getBlurHash } from "@/lib/image-blur";
import { getImageProvenance } from "@/lib/image-provenance";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { THEME_HUBS, hubStories, type ThemeHub } from "@/lib/theme-hubs";

export const THEME_COUNT = THEME_HUBS.length;

function leadStoryForHub(hub: ThemeHub) {
  const stories = hubStories(hub).filter((s) => Boolean(s.imageUrl));
  return (
    stories.find(
      (s) => getImageProvenance("story", s.id)?.kind === "illustration-ai",
    ) ?? stories[0]
  );
}

/**
 * Myth themes on /paths (formerly the /themes index): stories from different
 * traditions that turn on the same idea. Theme pages keep their /themes/[slug]
 * URLs.
 */
export function ThemesSection() {
  const shortNames = getPantheonShortNames();
  return (
    <section id="themes" aria-labelledby="paths-themes" className="scroll-mt-24">
      <p className="type-eyebrow mb-2">Same story, many cultures</p>
      <h2 id="paths-themes" className="page-section-title">
        Myth themes
      </h2>
      <p className="mt-3 max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
        Floods, creation, tricksters and journeys to the underworld: each theme
        gathers the stories in the atlas that tell it. Similar stories are not
        treated as proof of a shared origin.
      </p>
      <EntityGrid className="mt-8">
        {THEME_HUBS.map((hub) => {
          const lead = leadStoryForHub(hub);
          const traditions = [
            ...new Set(
              hubStories(hub).map(
                (s) => shortNames[s.pantheonId] ?? s.pantheonId,
              ),
            ),
          ];
          return (
            <EntityCard
              key={hub.slug}
              href={`/themes/${hub.slug}`}
              title={hub.title}
              image={lead?.imageUrl}
              blurHash={getBlurHash(lead?.imageUrl)}
              aspect="landscape"
              headingLevel="h3"
              traditionColor={
                lead ? getPantheonColor(lead.pantheonId) : undefined
              }
              subtitle={traditions.slice(0, 4).join(" · ")}
              description={hub.description}
              descriptionLines={3}
              meta={`${hub.stories.length} stories`}
            />
          );
        })}
      </EntityGrid>
    </section>
  );
}
