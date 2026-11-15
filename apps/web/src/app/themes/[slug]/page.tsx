import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageHero } from "@/components/layout/page-hero";
import { CollectionPageJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import { formatPantheonLabel } from "@/lib/deity-page";
import { generateBaseMetadata, generateNotFoundMetadata } from "@/lib/metadata";
import { truncateDescription } from "@/lib/seo/description";
import { THEME_HUBS, getThemeHub, hubStories } from "@/lib/theme-hubs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every hub is prerendered; anything else is a static 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return THEME_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({
  params,
}: Readonly<PageProps>): Promise<Metadata> {
  const { slug } = await params;
  const hub = getThemeHub(slug);
  if (!hub) {
    return generateNotFoundMetadata(
      "Theme Not Found",
      "No theme page exists for this name.",
    );
  }
  return generateBaseMetadata({
    title: `${hub.title}: Stories from ${hubStories(hub).length} Myths Compared`,
    description: truncateDescription(hub.description),
    url: `/themes/${hub.slug}`,
    image: null,
    keywords: [hub.title, "mythology", "myths across cultures"],
  });
}

export default async function ThemeHubPage({ params }: Readonly<PageProps>) {
  const { slug } = await params;
  const hub = getThemeHub(slug);
  if (!hub) notFound();
  const stories = hubStories(hub);
  const url = `/themes/${hub.slug}`;
  const others = THEME_HUBS.filter((h) => h.slug !== hub.slug);

  return (
    <>
      <CollectionPageJsonLd
        name={hub.title}
        description={hub.description}
        url={url}
        numberOfItems={stories.length}
      />
      <ItemListJsonLd
        name={hub.title}
        description={hub.description}
        url={url}
        items={stories.map((s, i) => ({
          name: s.title,
          url: `/stories/${s.slug}`,
          position: i + 1,
        }))}
      />
      <PageHero
        mark="codex"
        tagline="Same story, many cultures"
        title={hub.title}
        description={hub.description}
        count={`${stories.length} stories`}
      />
      <Container className="pt-8 pb-4 md:pt-10">
        <p className="max-w-3xl text-lg leading-relaxed text-foreground/90">
          {hub.claim}
        </p>
      </Container>
      <Container className="pb-12">
        <ol className="mt-6 divide-y divide-border/70 border-y border-border/70">
          {stories.map((story) => (
            <li key={story.slug} className="py-5">
              <p className="type-meta text-muted-foreground">
                {formatPantheonLabel(story.pantheonId)}
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold leading-tight">
                <Link
                  href={`/stories/${story.slug}`}
                  className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {story.title}
                </Link>
              </h2>
              <p className="mt-2 max-w-3xl text-foreground/85">
                {story.summary}
              </p>
            </li>
          ))}
        </ol>
        <nav aria-label="More themes" className="mt-10">
          <h2 className="font-serif text-xl font-semibold">More themes</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/themes/${h.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3 text-sm text-foreground/85 hover:border-gold/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  {h.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
