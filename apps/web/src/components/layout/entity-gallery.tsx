import Image from "next/image";
import Link from "next/link";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────
   Image-led link collections for entity pages (server components).

   <EntityGallery items aspect columns/>  portrait or square tiles: image,
     name, one meta line and an optional two-line description. For the
     members of a pantheon, a collection or a story.
   <EntityList items/>  a manuscript list with a small thumbnail: title,
     meta and a summary. For stories, sources and other text-first entries.
   ───────────────────────────────────────────────────────────────────── */

export interface EntityLinkItem {
  name: string;
  href: string;
  imageUrl?: string | null;
  /** Remote museum images are served as-is. */
  unoptimized?: boolean;
  /** Tradition, role or type, one line. */
  meta?: string | null;
  /** A pantheon id: shows its colour dot before the meta line. */
  pantheonId?: string;
  description?: string | null;
}

function Thumb({
  item,
  sizes,
  className,
  initialClassName = "text-2xl",
}: {
  item: EntityLinkItem;
  sizes: string;
  className?: string;
  initialClassName?: string;
}) {
  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border/80",
        className,
      )}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt=""
          fill
          sizes={sizes}
          unoptimized={item.unoptimized}
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <span
          className={cn(
            "flex h-full items-center justify-center bg-linear-to-br from-muted to-card font-serif text-gold-text",
            initialClassName,
          )}
          aria-hidden="true"
        >
          {item.name.charAt(0)}
        </span>
      )}
    </span>
  );
}

function Meta({ item }: { item: EntityLinkItem }) {
  if (!item.meta) return null;
  return (
    <span className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] leading-snug text-muted-foreground">
      {item.pantheonId ? (
        <span
          className="inline-block size-2 shrink-0 rounded-full"
          style={{ backgroundColor: getPantheonColor(item.pantheonId) }}
          aria-hidden="true"
        />
      ) : null}
      <span className="truncate first-letter:uppercase">{item.meta}</span>
    </span>
  );
}

const GALLERY_COLUMNS = {
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
} as const;

/** Portrait (4:5) or square tiles for figures, places and objects. */
export function EntityGallery({
  items,
  label,
  aspect = "portrait",
  columns = 4,
  className,
}: {
  items: EntityLinkItem[];
  /** Accessible name for the list, when the heading does not label it. */
  label?: string;
  aspect?: "portrait" | "square" | "landscape";
  columns?: keyof typeof GALLERY_COLUMNS;
  className?: string;
}) {
  if (items.length === 0) return null;
  const ratio =
    aspect === "portrait"
      ? "aspect-4/5"
      : aspect === "landscape"
        ? "aspect-3/2"
        : "aspect-square";
  return (
    <ul
      aria-label={label}
      className={cn(
        "grid gap-x-4 gap-y-7 sm:gap-x-5",
        GALLERY_COLUMNS[columns],
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.href} className="min-w-0">
          <Link
            href={item.href}
            className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            <Thumb
              item={item}
              sizes="(min-width: 1024px) 14rem, (min-width: 640px) 30vw, 45vw"
              className={cn("w-full", ratio)}
              initialClassName="text-4xl"
            />
            <span className="mt-3 block font-serif text-[1.0625rem] font-semibold leading-snug text-foreground group-hover:text-gold-text">
              {item.name}
            </span>
            <span className="mt-1 block">
              <Meta item={item} />
            </span>
            {item.description ? (
              <span className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-snug text-muted-foreground">
                {item.description}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A text-first list with small thumbnails (stories, works, journeys). */
export function EntityList({
  items,
  label,
  columns = 1,
  className,
}: {
  items: EntityLinkItem[];
  label?: string;
  columns?: 1 | 2;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ul
      aria-label={label}
      className={cn(
        "grid border-t border-border/70",
        columns === 2 && "md:grid-cols-2 md:gap-x-10",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.href} className="min-w-0 border-b border-border/70">
          <Link
            href={item.href}
            className="group flex items-start gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <Thumb
              item={item}
              sizes="4.5rem"
              className="aspect-square w-16 sm:w-[4.5rem]"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-serif text-[1.0625rem] font-semibold leading-snug text-foreground group-hover:text-gold-text">
                {item.name}
              </span>
              <span className="mt-0.5 block">
                <Meta item={item} />
              </span>
              {item.description ? (
                <span className="mt-1.5 line-clamp-2 text-[0.9375rem] leading-snug text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
