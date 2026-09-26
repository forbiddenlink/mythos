import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/layout/section";
import { GUIDES } from "@/lib/guides";

/** A catalog portrait that stands for each guide's subject. */
const GUIDE_IMAGES: Record<string, string> = {
  "percy-jackson-titans-curse": "/deities/artemis.jpg",
  odyssey: "/deities/poseidon.jpg",
  "hades-ii": "/deities/hades.jpg",
};

/**
 * Homepage entry to the editorial guides: image-led cards, server-rendered.
 */
export function GuidesStrip() {
  return (
    <Section aria-labelledby="guides-strip-heading">
      <SectionHeading
        id="guides-strip-heading"
        eyebrow="Guides"
        title="The myths behind the story"
        description="What novels, epics and games took from ancient myth, and what they invented."
        action={{ href: "/guides", label: "All guides" }}
      />
      <ul className="grid gap-x-6 gap-y-10 md:grid-cols-3">
        {GUIDES.map((guide) => {
          const image = GUIDE_IMAGES[guide.slug];
          return (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {image ? (
                  <span className="relative block aspect-[3/2] overflow-hidden rounded-md bg-muted ring-1 ring-border/70">
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 24rem, 100vw"
                      className="object-cover object-[50%_30%] transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </span>
                ) : null}
                <span className="mt-4 block font-serif text-xl font-semibold leading-snug text-foreground group-hover:text-gold-text">
                  {guide.shortTitle}
                </span>
                <span className="mt-1.5 line-clamp-3 block font-body text-[1.0625rem] leading-relaxed text-muted-foreground">
                  {guide.description}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
