import { IllustrativeImageCaption } from "@/components/content/IllustrativeImageCaption";
import { DetailHero } from "@/components/layout/detail-layout";
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

/** Hero for a deity entry, on the shared DetailHero template. */
export function DeityHero({
  deity,
  traditionLabel,
  museumPortrait,
  imageNote,
}: {
  deity: DeityRecord;
  traditionLabel?: string;
  museumPortrait: MuseumObject | null;
  imageNote?: ImageNote;
}) {
  const image = deity.imageUrl
    ? { src: deity.imageUrl, alt: deity.name }
    : museumPortrait?.imageUrl
      ? {
          src: museumPortrait.imageUrl,
          alt: museumPortrait.imageAlt || museumPortrait.title,
          unoptimized: true,
          fit: "contain" as const,
        }
      : null;

  const caption = deity.imageUrl ? (
    <IllustrativeImageCaption
      note={imageNote}
      subject={`Illustration of ${deity.name}`}
      tone="light"
    />
  ) : museumPortrait ? (
    <figcaption className="type-meta text-parchment/75">
      {museumPortrait.title}, {museumPortrait.institution}
    </figcaption>
  ) : null;

  return (
    <DetailHero
      accentColor={getPantheonColor(deity.pantheonId)}
      image={image}
      imageCaption={caption}
      imageFallback={
        <span className="font-serif text-7xl text-gold/70" aria-hidden="true">
          {deity.name.charAt(0)}
        </span>
      }
      imageTransitionName={`deity-image-${deity.slug}`}
      titleTransitionName="page-header"
      eyebrow={
        <>
          <span>{traditionLabel ?? formatPantheonLabel(deity.pantheonId)}</span>
          {deity.traditionRole ? (
            <>
              <span className="text-gold/50" aria-hidden="true">
                ·
              </span>
              <span className="text-parchment/85">{deity.traditionRole}</span>
            </>
          ) : null}
        </>
      }
      title={deity.name}
      titleAddon={
        deity.pronunciation ? (
          <PronunciationDisplay
            pronunciation={deity.pronunciation}
            className="text-parchment/75 hover:text-parchment"
          />
        ) : null
      }
      nativeName={
        deity.originalLanguageName ? (
          <OriginalLanguageName
            data={deity.originalLanguageName}
            variant="inline"
            className="text-parchment/90"
          />
        ) : null
      }
      epithets={deity.alternateNames}
      tags={deity.domain}
      lede={deity.description ? <p>{deity.description}</p> : null}
      actions={
        <>
          <BookmarkButton
            type="deity"
            id={deity.id}
            size="md"
            variant="light"
            className="flex size-10 items-center justify-center border border-parchment/25 hover:border-gold/60"
          />
          <ShareButton
            surface="deity_page"
            title={`${deity.name} - Mythos Atlas`}
            text={`Discover ${deity.name}, ${deity.domain?.join(", ") || "deity"} from ancient mythology on Mythos Atlas`}
            url={`https://mythosatlas.com/deities/${deity.slug}`}
            className="[&_button]:h-10 [&_button]:rounded-full [&_button]:px-4"
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
            className="size-10 rounded-full border border-parchment/25 text-parchment hover:border-gold/60 hover:bg-white/10"
          />
        </>
      }
    />
  );
}
