import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { MuseumObject } from "@/lib/museum";

export interface FeaturedTradition {
  name: string;
  slug: string;
  culture: string;
  description: string;
  imageUrl: string;
  figureCount: number;
  /** Label for the figures ("deities", "figures"). */
  figuresLabel: string;
  artwork?: MuseumObject;
}

/** One opening plate and a manuscript list keep the traditions easy to scan. */
export function PantheonShowcase({
  traditions,
  totalTraditions,
}: {
  traditions: FeaturedTradition[];
  totalTraditions: number;
}) {
  const [lead, ...companions] = traditions;
  if (!lead) return null;
  return (
    <Section
      id="featured-pantheons"
      aria-labelledby="featured-pantheons-title"
      className="scroll-mt-20"
    >
      <SectionHeading
        id="featured-pantheons-title"
        eyebrow="Begin with a tradition"
        title="Featured pantheons"
        description="Start with a place, then meet its gods and follow its stories."
        action={{
          href: "/pantheons",
          label: `All ${totalTraditions} traditions`,
        }}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <Link
            href={`/pantheons/${lead.slug}`}
            className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <span
              className={cn(
                "plate-flat relative block aspect-3/2 overflow-hidden",
                lead.artwork ? "bg-parchment" : "bg-midnight",
              )}
            >
              <Image
                src={lead.imageUrl}
                alt={lead.artwork?.imageAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 36rem, 100vw"
                className={cn(
                  lead.artwork ? "object-contain" : "object-cover",
                  "motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.025]",
                )}
              />
            </span>
            <span className="type-eyebrow mt-4 block">{lead.culture}</span>
            <span className="mt-1 flex items-center justify-between gap-4 font-serif text-2xl text-foreground group-hover:text-gold-text">
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {lead.name}
              </span>
              <ArrowRight
                className="size-5 shrink-0 motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
            <span className="mt-2 block max-w-xl font-body text-lg leading-relaxed text-muted-foreground">
              {lead.description}
            </span>
            <span className="type-meta mt-3 block text-muted-foreground">
              {lead.figureCount} {lead.figuresLabel}
            </span>
          </Link>
          {lead.artwork ? (
            <p className="type-meta mt-3 leading-relaxed text-muted-foreground">
              {lead.artwork.title}, {lead.artwork.date}.{" "}
              <a
                href={lead.artwork.url}
                className="underline underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {lead.artwork.institution}
              </a>
            </p>
          ) : null}
        </div>
        <ul className="min-w-0 divide-y divide-border border-y border-border">
          {companions.map((tradition) => (
            <li key={tradition.slug}>
              <Link
                href={`/pantheons/${tradition.slug}`}
                className="group flex min-h-28 items-center gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:gap-5"
              >
                <span className="plate-flat relative block aspect-square w-1/4 max-w-24 shrink-0 overflow-hidden bg-midnight">
                  <Image
                    src={tradition.imageUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-[1.025]"
                  />
                </span>
                <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                  <span className="type-meta block text-muted-foreground">
                    {tradition.culture}
                  </span>
                  <span className="mt-1 block font-serif text-xl leading-snug text-foreground group-hover:text-gold-text">
                    {tradition.name}
                  </span>
                  <span className="type-meta mt-2 block text-muted-foreground">
                    {tradition.figureCount} {tradition.figuresLabel}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-gold-text motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="type-meta mt-5 text-muted-foreground">
        Supporting landscape views are illustrations.{" "}
        <Link
          href="/about#images"
          className="underline underline-offset-2 hover:text-foreground"
        >
          About our images
        </Link>
      </p>
    </Section>
  );
}
