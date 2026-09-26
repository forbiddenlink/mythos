import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/layout/section";
import { cn } from "@/lib/utils";

export interface FeaturedTradition {
  name: string;
  slug: string;
  culture: string;
  description: string;
  imageUrl: string;
  figureCount: number;
  /** Label for the figures ("deities", "figures"). */
  figuresLabel: string;
}

/**
 * Image-led entry to the traditions: one lead card and four companions in a
 * bento grid. Server-rendered; the page picks the traditions and images.
 */
export function PantheonShowcase({
  traditions,
  totalTraditions,
}: {
  traditions: FeaturedTradition[];
  totalTraditions: number;
}) {
  if (traditions.length === 0) return null;
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
        description="Orient in a tradition first, then branch into its gods, myths and sacred places."
        action={{
          href: "/pantheons",
          label: `All ${totalTraditions} traditions`,
        }}
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        {traditions.map((tradition, index) => {
          const lead = index === 0;
          return (
            <li
              key={tradition.slug}
              className={cn(lead && "sm:col-span-2 lg:row-span-2")}
            >
              <Link
                href={`/pantheons/${tradition.slug}`}
                className="group relative isolate flex h-full min-h-60 flex-col justify-end overflow-hidden rounded-lg bg-midnight p-5 text-parchment ring-1 ring-border/60 transition-shadow hover:shadow-xl hover:shadow-black/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-64 md:p-6"
              >
                <Image
                  src={tradition.imageUrl}
                  alt=""
                  fill
                  sizes={
                    lead
                      ? "(min-width: 1024px) 38rem, (min-width: 640px) 100vw, 100vw"
                      : "(min-width: 1024px) 19rem, (min-width: 640px) 50vw, 100vw"
                  }
                  className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute inset-0 -z-10 bg-linear-to-t from-midnight via-midnight/55 to-midnight/5"
                  aria-hidden="true"
                />
                <span className="text-[0.8125rem] font-medium uppercase tracking-[0.16em] text-gold-light">
                  {tradition.culture}
                </span>
                <span
                  className={cn(
                    "mt-1 font-serif font-semibold leading-tight",
                    lead ? "text-3xl md:text-4xl" : "text-2xl",
                  )}
                >
                  {tradition.name}
                </span>
                {lead ? (
                  <span className="mt-3 max-w-md font-body text-lg leading-snug text-parchment/85">
                    {tradition.description}
                  </span>
                ) : null}
                <span className="mt-3 flex items-center justify-between gap-3 text-sm text-parchment/80">
                  {tradition.figureCount} {tradition.figuresLabel}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
