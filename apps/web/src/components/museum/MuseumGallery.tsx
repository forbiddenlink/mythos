import Image from "next/image";
import type { MuseumObject } from "@/lib/museum";
import { cn } from "@/lib/utils";

/**
 * Real, public-domain objects that depict a figure or a myth, hung like plates
 * on a gallery wall. Presentational only: callers pass the objects (filtered
 * on the server) so the full collection never ships to the client, and wrap
 * it in an <ArticleSection> that supplies the heading.
 */
export function MuseumGallery({
  objects,
  intro = "Real objects in public collections, released into the public domain by the museums that hold them. Dates refer to when each object was made. Objects made within the tradition come first, later depictions after.",
  columns = 3,
}: {
  objects: MuseumObject[];
  intro?: string | null;
  /** Three plates a row in the article column; two for large story plates. */
  columns?: 2 | 3;
}) {
  if (objects.length === 0) return null;

  return (
    <div>
      {intro ? (
        <p className="max-w-reading type-ui text-muted-foreground">{intro}</p>
      ) : null}
      <ul
        className={cn(
          "mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2",
          columns === 3 && "lg:grid-cols-3",
        )}
      >
        {objects.map((object) => (
          <li key={object.id} className="flex min-w-0 flex-col">
            {object.imageUrl ? (
              <a
                href={object.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group mb-4 block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                <span className="relative block aspect-4/5 overflow-hidden rounded-md bg-midnight ring-1 ring-border/60">
                  <Image
                    src={object.imageUrl}
                    alt={object.imageAlt || object.title}
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="sr-only"> (opens the museum record)</span>
              </a>
            ) : null}
            <p className="type-eyebrow">{object.context}</p>
            <h3 className="mt-1 font-serif text-[1.0625rem] font-semibold leading-snug text-foreground">
              <a
                href={object.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold-text"
              >
                {object.title}
                <span className="sr-only"> (opens the museum record)</span>
              </a>
            </h3>
            <p className="mt-1 type-meta text-muted-foreground">
              {[object.creator ?? object.culture, object.date, object.medium]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-foreground/85">
              {object.description}
            </p>
            <p className="mt-auto pt-3 type-meta text-muted-foreground">
              {object.institution}
              {object.accessionNumber ? ` · ${object.accessionNumber}` : ""}
              {object.imageRights ? ` · ${object.imageRights}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
