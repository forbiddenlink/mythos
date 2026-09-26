import objectsData from "@/data/museum-objects.json";

export interface MuseumObject {
  id: string;
  title: string;
  institution: string;
  accessionNumber?: string;
  date?: string;
  culture?: string;
  creator?: string;
  medium?: string;
  context: string;
  description: string;
  url: string;
  imageRights: string;
  imageUrl?: string;
  imageAlt?: string;
  storyIds?: string[];
  deityIds?: string[];
  creatureIds?: string[];
  heroIds?: string[];
}

const ANCIENT = "Ancient object";

/**
 * Real, public-domain museum objects that depict a figure. Objects made within
 * the tradition come first; later European depictions follow, so a page shows
 * ancient attestation before later reception.
 */
export function getMuseumObjectsFor(
  ref: { deity?: string; creature?: string; hero?: string },
  source: MuseumObject[] = objectsData as MuseumObject[],
): MuseumObject[] {
  return source
    .filter(
      (o) =>
        o.imageUrl &&
        ((ref.deity && o.deityIds?.includes(ref.deity)) ||
          (ref.creature && o.creatureIds?.includes(ref.creature)) ||
          (ref.hero && o.heroIds?.includes(ref.hero))),
    )
    .sort(
      (a, b) => Number(b.context === ANCIENT) - Number(a.context === ANCIENT),
    );
}

/**
 * A portrait for a figure with no painting: an ancient object if there is one,
 * else a later work made within the tradition (a Rajput Ramayana folio for
 * Sita). Never a later European depiction, which would put reception first.
 */
export function getMuseumPortrait(
  objects: MuseumObject[],
): MuseumObject | null {
  const withImage = objects.filter((o) => o.imageUrl);
  return (
    withImage.find((o) => o.context === ANCIENT) ??
    withImage.find((o) => o.context === "Later depiction") ??
    null
  );
}

/** Documented objects and later interpretations of one story. */
export function getMuseumObjectsForStory(
  storyId: string,
  source: MuseumObject[] = objectsData as MuseumObject[],
): MuseumObject[] {
  return source.filter((o) => o.storyIds?.includes(storyId));
}
