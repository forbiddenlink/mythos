import objects from "@/data/museum-objects.json";
import Image from "next/image";

export function MuseumObjects({ storyId }: { storyId: string }) {
  const entries = objects.filter((object) =>
    (object.storyIds as string[]).includes(storyId),
  );
  if (entries.length === 0) return null;

  return (
    <section
      aria-labelledby="museum-objects-title"
      className="border-y border-border py-8"
    >
      <h2
        id="museum-objects-title"
        className="page-section-title text-foreground"
      >
        The myth in art
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Explore documented objects and later interpretations. Dates refer to the
        objects, not the events of the story.
      </p>
      <ul className="mt-6 space-y-6">
        {entries.map((object) => (
          <li key={object.id}>
            {object.imageUrl && (
              <figure className="mb-5">
                <div className="relative h-72 bg-muted/40 sm:h-96">
                  <Image
                    src={object.imageUrl}
                    alt={object.imageAlt || object.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-contain p-4"
                  />
                </div>
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {object.institution} · {object.imageRights}
                </figcaption>
              </figure>
            )}
            <p className="text-xs uppercase tracking-wide text-gold-text">
              {object.context}
            </p>
            <h3 className="mt-2 font-serif text-xl text-foreground">
              <a
                href={object.url}
                className="underline decoration-border underline-offset-4 hover:decoration-gold"
              >
                {object.title}
              </a>
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {object.creator ?? object.culture} · {object.date} ·{" "}
              {object.medium}
            </p>
            <p className="mt-3 leading-relaxed text-foreground">
              {object.description}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {object.institution} · {object.accessionNumber}
            </p>
            <a
              href={object.url}
              className="mt-2 inline-flex min-h-11 items-center text-sm text-gold-text underline underline-offset-4"
            >
              View object and images at the museum
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
