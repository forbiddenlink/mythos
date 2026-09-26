import Image from "next/image";
import Link from "next/link";
import { EditorialByline } from "@/components/content/EditorialByline";
import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import type { ImageNote } from "@/lib/image-provenance";
import { ShareButton } from "@/components/sharing/ShareButton";
import { OriginalLanguageName } from "@/components/sources/OriginalLanguageName";
import { BookmarkButton } from "@/components/ui/bookmark-button";
import { ExportIconButton } from "@/components/ui/export-button";
import { PronunciationDisplay } from "@/components/ui/pronunciation";
import type { DeityRecord } from "@/lib/data/types";
import { formatPantheonLabel } from "@/lib/deity-page";
import type { MuseumObject } from "@/lib/museum";
import { getPantheonColor } from "@/lib/pantheon-colors";

const DEITY_IMAGE_WIDTH = 768;
const DEITY_IMAGE_HEIGHT = 1024;

export function DeityHero({
  deity,
  traditionLabel,
  museumPortrait,
  hasSources,
  imageNote,
}: {
  deity: DeityRecord;
  traditionLabel?: string;
  museumPortrait: MuseumObject | null;
  hasSources: boolean;
  imageNote?: ImageNote;
}) {
  return (
    <div className="relative overflow-hidden bg-midnight">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-linear-to-br from-midnight/90 via-midnight/75 to-midnight/55"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(10,10,25,0.92) 0%, ${getPantheonColor(deity.pantheonId)}33 55%, rgba(10,10,25,0.85) 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-midnight via-transparent to-midnight/40" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-12 md:py-16 relative z-10">
        <Link
          href="/deities"
          className="text-sm text-parchment/70 hover:text-parchment mb-8 inline-block"
        >
          ← Back to Deities
        </Link>

        <div className="grid gap-10 md:grid-cols-[minmax(0,14rem)_1fr] md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-gold/80 flex flex-wrap items-center gap-2">
              <span>
                {traditionLabel ?? formatPantheonLabel(deity.pantheonId)}
              </span>
              {deity.traditionRole && (
                <>
                  <span className="text-gold/40" aria-hidden>
                    •
                  </span>
                  <span className="text-parchment/90 font-medium tracking-wider">
                    {deity.traditionRole}
                  </span>
                </>
              )}
            </p>
            <div
              className="flex flex-col gap-4"
              style={{ viewTransitionName: "page-header" }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="page-title text-parchment">{deity.name}</h1>
                  {deity.pronunciation && (
                    <PronunciationDisplay
                      pronunciation={deity.pronunciation}
                      className="text-parchment/75 hover:text-parchment"
                    />
                  )}
                </div>
                {deity.originalLanguageName && (
                  <p className="mt-2 font-serif text-xl text-parchment/80 md:text-2xl">
                    <OriginalLanguageName
                      data={deity.originalLanguageName}
                      variant="inline"
                      className="text-parchment/90"
                    />
                  </p>
                )}
                {deity.alternateNames && deity.alternateNames.length > 0 && (
                  <p className="mt-2 text-sm font-light text-parchment/70">
                    Also known as: {deity.alternateNames.join(", ")}
                  </p>
                )}
                {deity.domain && deity.domain.length > 0 && (
                  <ul
                    className="mt-4 flex flex-wrap gap-2"
                    aria-label="Domains"
                  >
                    {deity.domain.map((d) => (
                      <li
                        key={d}
                        className="border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-gold-light backdrop-blur-sm"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {deity.description && (
                  <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-parchment/85 md:text-lg">
                    {deity.description}
                  </p>
                )}
                <nav
                  aria-label="On this page"
                  className="mt-5 flex flex-wrap gap-x-6 gap-y-2"
                >
                  <a
                    href="#deity-about"
                    className="inline-flex min-h-11 items-center font-medium text-parchment underline underline-offset-4"
                  >
                    About {deity.name}
                  </a>
                  {hasSources && (
                    <a
                      href="#deity-sources"
                      className="inline-flex min-h-11 items-center text-parchment underline underline-offset-4"
                    >
                      Sources and further reading
                    </a>
                  )}
                </nav>
                <EditorialByline className="mt-4 max-w-2xl" tone="light" />
              </div>
              <div className="flex shrink-0 gap-2">
                <BookmarkButton
                  type="deity"
                  id={deity.id}
                  size="lg"
                  variant="light"
                />
                <ShareButton
                  surface="deity_page"
                  title={`${deity.name} - Mythos Atlas`}
                  text={`Discover ${deity.name}, ${deity.domain?.join(", ") || "deity"} from ancient mythology on Mythos Atlas`}
                  url={`https://mythosatlas.com/deities/${deity.slug}`}
                  className="[&_button]:text-foreground"
                />
                <ExportIconButton
                  type="deity"
                  data={{
                    name: deity.name,
                    alternateNames: deity.alternateNames,
                    description: deity.description,
                    detailedBio: deity.detailedBio,
                    originStory: deity.originStory,
                    domain: deity.domain,
                    symbols: deity.symbols,
                    pantheonId: deity.pantheonId,
                    imageUrl: deity.imageUrl,
                    primarySources: deity.primarySources,
                    worship: deity.worship,
                  }}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                />
              </div>
            </div>
          </div>
          <figure
            className="relative mx-auto w-full md:order-first max-w-[14rem] overflow-hidden border border-gold/30 shadow-2xl"
            style={{ viewTransitionName: `deity-image-${deity.slug}` }}
          >
            <div className="aspect-3/4 relative bg-midnight">
              {deity.imageUrl ? (
                <Image
                  src={deity.imageUrl}
                  alt={deity.name}
                  width={DEITY_IMAGE_WIDTH}
                  height={DEITY_IMAGE_HEIGHT}
                  sizes="14rem"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : museumPortrait?.imageUrl ? (
                <Image
                  src={museumPortrait.imageUrl}
                  alt={museumPortrait.imageAlt || museumPortrait.title}
                  fill
                  unoptimized
                  sizes="14rem"
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-serif text-7xl text-gold/70">
                    {deity.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {deity.imageUrl && (
              <IllustrativeImageCaption
                note={imageNote}
                subject={`Illustration of ${deity.name}`}
                tone="light"
                className="bg-midnight px-3 py-2"
              />
            )}
            {!deity.imageUrl && museumPortrait && (
              <figcaption className="bg-midnight/90 px-2 py-1.5 text-[0.65rem] leading-snug text-parchment/75">
                {museumPortrait.title}, {museumPortrait.institution}
              </figcaption>
            )}
          </figure>
        </div>
      </div>
    </div>
  );
}
