import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EndingsDiscovered } from "@/components/home/EndingsDiscovered";

export interface InteractiveStorySummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  totalEndings: number;
  estimatedTime?: string;
}

/**
 * Promo for the branching myths: the featured story's cover as a large image,
 * the pitch beside it and the other stories as a short list. Server-rendered;
 * only the "endings discovered" count reads localStorage.
 */
export function InteractiveStoriesBanner({
  stories,
}: {
  stories: InteractiveStorySummary[];
}) {
  const [featured, ...others] = stories;
  if (!featured) return null;
  const totalEndings = stories.reduce((sum, s) => sum + s.totalEndings, 0);

  return (
    <section
      aria-labelledby="interactive-stories-title"
      className="section-space"
    >
      <Container>
        <div className="dark relative isolate grid overflow-hidden rounded-xl bg-midnight text-foreground ring-1 ring-gold/20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <Link
            href={`/stories/interactive/${featured.slug}`}
            className="group relative block min-h-72 overflow-hidden sm:min-h-96 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gold"
          >
            {featured.coverImage ? (
              <Image
                src={featured.coverImage}
                alt={`Illustration for ${featured.title}`}
                fill
                sizes="(min-width: 1024px) 38rem, 100vw"
                className="object-cover object-[50%_35%] transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : null}
            <span
              className="absolute inset-0 bg-linear-to-t from-midnight via-midnight/20 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-midnight/70"
              aria-hidden="true"
            />
            <span className="absolute bottom-0 left-0 p-5 sm:p-7 lg:hidden">
              <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-midnight">
                Featured
              </span>
            </span>
          </Link>

          <div className="relative flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-12">
            <div>
              <p className="type-eyebrow text-gold-light">Branching myths</p>
              <h2
                id="interactive-stories-title"
                className="page-section-title mt-2 text-parchment"
              >
                Stand where the heroes stood
              </h2>
              <p className="mt-4 font-body text-lg leading-relaxed text-parchment/85">
                <span className="font-semibold text-parchment">
                  {featured.title}.
                </span>{" "}
                {featured.description} Your choices decide the ending.
              </p>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-sm text-parchment/75">
              <span>
                <span className="font-serif text-2xl font-semibold text-parchment">
                  {stories.length}
                </span>{" "}
                stories
              </span>
              <EndingsDiscovered
                storyIds={stories.map((s) => s.id)}
                totalEndings={totalEndings}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href={`/stories/interactive/${featured.slug}`}>
                  Play {featured.title} <ArrowRight />
                </Link>
              </Button>
            </div>

            {others.length > 0 ? (
              <div className="border-t border-parchment/15 pt-5">
                <p className="mb-2 text-[0.8125rem] uppercase tracking-[0.16em] text-parchment/65">
                  Also playable
                </p>
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {others.map((story) => (
                    <li key={story.id}>
                      <Link
                        href={`/stories/interactive/${story.slug}`}
                        className="inline-flex min-h-9 items-center text-[0.9375rem] text-parchment underline decoration-gold/40 underline-offset-4 hover:text-gold-light hover:decoration-current"
                      >
                        {story.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href="/stories/interactive"
                      className="inline-flex min-h-9 items-center gap-1 text-[0.9375rem] text-gold-light hover:underline"
                    >
                      All interactive stories
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
