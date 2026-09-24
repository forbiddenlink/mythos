import Image from "next/image";
import type { MuseumObject } from "@/lib/museum";

/**
 * "In the museums" — real, public-domain objects that depict a figure, hung
 * like plates on a gallery wall. Presentational only: callers pass the objects
 * (filtered on the server) so the full collection never ships to the client.
 */
export function MuseumGallery({
  name,
  objects,
}: {
  name: string;
  objects: MuseumObject[];
}) {
  if (objects.length === 0) return null;

  return (
    <section aria-labelledby="museum-gallery-title" className="mb-12">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-gold-text">
        In the museums
      </p>
      <h2
        id="museum-gallery-title"
        className="mb-2 font-serif text-2xl font-semibold text-foreground"
      >
        {name} in art
      </h2>
      <p className="mb-6 max-w-[68ch] text-sm text-muted-foreground">
        Real objects in public collections, released into the public domain by
        the museums that hold them. Dates refer to when each object was made.
        Objects made within the tradition come first, later depictions after.
      </p>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {objects.map((object) => (
          <li
            key={object.id}
            className="flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card/50"
          >
            <a
              href={object.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="relative aspect-4/5 bg-midnight">
                {object.imageUrl && (
                  <Image
                    src={object.imageUrl}
                    alt={object.imageAlt || object.title}
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                )}
              </div>
              <span className="sr-only"> (opens the museum record)</span>
            </a>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-gold-text">
                {object.context}
              </p>
              <h3 className="mt-1 font-serif text-base leading-snug text-foreground">
                {object.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {[object.creator ?? object.culture, object.date, object.medium]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                {object.description}
              </p>
              <p className="mt-auto pt-3 text-xs text-muted-foreground">
                {object.institution}
                {object.accessionNumber ? ` · ${object.accessionNumber}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
