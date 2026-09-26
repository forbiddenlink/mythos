import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/page-hero";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { GUIDES } from "@/lib/guides";
import { generateBaseMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateBaseMetadata({
  title: "Mythology Guides: Epics, Novels and Games Read Against the Myths",
  description:
    "Guides to Homer's Odyssey, Percy Jackson's The Titan's Curse and Hades II: the ancient sources behind each, what the modern versions invent, and links to every figure and place.",
  url: "/guides",
  image: null,
  keywords: [
    "mythology guides",
    "Percy Jackson mythology",
    "Odyssey guide",
    "Hades II mythology",
  ],
});

export default function GuidesIndex() {
  return (
    <>
      <ItemListJsonLd
        name="Mythos Atlas guides"
        description="Editorial guides that set modern retellings and ancient epics beside their sources."
        url="/guides"
        items={GUIDES.map((guide, index) => ({
          name: guide.title,
          url: `/guides/${guide.slug}`,
          position: index + 1,
        }))}
      />
      <PageHero
        mark="codex"
        tagline="Guides"
        title="Read the Myths Behind the Story"
        description="Epics, novels and games, set beside the ancient sources they draw on."
        minHeight="min-h-[36vh]"
      />
      <div className="page-shell pb-20">
        <ul className="mt-8 max-w-[68ch] divide-y divide-border/50">
          {GUIDES.map((guide) => (
            <li key={guide.slug} className="py-6">
              <Link
                href={`/guides/${guide.slug}`}
                className="font-serif text-2xl text-foreground underline decoration-gold/50 underline-offset-4 hover:text-gold-text hover:decoration-current"
              >
                {guide.title}
              </Link>
              <p className="mt-2 font-body text-lg leading-relaxed text-muted-foreground">
                {guide.description}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[68ch] text-sm text-muted-foreground">
          Looking for a single domain instead? See the{" "}
          <Link
            href="/divine-domains"
            className="text-gold-text underline decoration-gold/50 underline-offset-4 hover:decoration-current"
          >
            gods by domain
          </Link>
          , from war and love to the sea and the dead.
        </p>
      </div>
    </>
  );
}
