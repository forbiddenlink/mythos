import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReadingProse } from "@/components/content/reading-prose";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { ReadingProgress } from "./ReadingProgress";

interface Plate {
  heading?: string;
  body: string;
}

/**
 * Break a markdown narrative into scroll "plates".
 * Prefers splitting on `##`/`###` headings; if the tale has none, it groups
 * paragraphs into pairs so each plate is a comfortable scroll beat.
 */
export function splitIntoPlates(markdown: string): Plate[] {
  const lines = markdown.split("\n");
  const plates: Plate[] = [];
  let heading: string | undefined;
  let body: string[] = [];

  const flush = () => {
    const text = body.join("\n").trim();
    if (heading || text) plates.push({ heading, body: text });
    heading = undefined;
    body = [];
  };

  for (const line of lines) {
    const match = line.match(/^#{2,3}\s+(.*)$/);
    if (match) {
      flush();
      heading = match[1].trim();
    } else {
      body.push(line);
    }
  }
  flush();

  // Only fall back to paragraph pairs when the tale had no headings at all;
  // a single heading-led plate is legitimate and must keep its heading.
  if (plates.length <= 1 && !plates[0]?.heading) {
    const paragraphs = markdown
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const grouped: Plate[] = [];
    for (let i = 0; i < paragraphs.length; i += 2) {
      grouped.push({ body: paragraphs.slice(i, i + 2).join("\n\n") });
    }
    return grouped.length > 0 ? grouped : [{ body: markdown }];
  }

  return plates;
}

interface ScrollytellingReaderProps {
  title: string;
  narrative: string;
  pantheonId: string;
  pantheonName?: string;
  imageUrl?: string | null;
  backHref: string;
}

/**
 * The cinematic reading: the tale set as numbered chapters on a dark,
 * candle-lit page under a full-bleed title plate. Server-rendered and static,
 * so every word is visible without JavaScript or scrolling; only the reading
 * progress rail runs in the browser.
 */
export function ScrollytellingReader({
  title,
  narrative,
  pantheonId,
  pantheonName,
  imageUrl,
  backHref,
}: ScrollytellingReaderProps) {
  const color = getPantheonColor(pantheonId);
  const plates = splitIntoPlates(narrative);

  return (
    <div className="dark relative isolate bg-midnight text-parchment">
      <ReadingProgress color={color} />

      {/* Title plate */}
      <header className="relative isolate flex min-h-[78vh] flex-col overflow-hidden">
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 70% at 50% 35%, color-mix(in oklch, ${color} 22%, transparent), transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/50 to-midnight" />
        </div>

        <div className="layout-container layout-container-content pt-6">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center gap-2 type-ui text-parchment/80 transition-colors hover:text-gold-light"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the entry
          </Link>
        </div>

        <div className="layout-container layout-container-content flex flex-1 flex-col items-center justify-center pb-16 pt-10 text-center">
          <div>
            <p className="type-eyebrow text-gold-light">
              {pantheonName ? `${pantheonName} · A reading` : "A reading"}
            </p>
            <h1 className="detail-title mx-auto mt-5 max-w-[18ch] text-parchment text-balance">
              {title}
            </h1>
            <div
              className="mt-8 flex items-center justify-center gap-4"
              aria-hidden="true"
            >
              <span className="h-px w-16 bg-gold/50" />
              <span className="size-2 rotate-45 bg-gold" />
              <span className="h-px w-16 bg-gold/50" />
            </div>
            <p className="mt-6 type-ui text-parchment/75">
              {plates.length} {plates.length === 1 ? "chapter" : "chapters"}
            </p>
          </div>
        </div>
      </header>

      {/* The tale */}
      <article className="layout-container layout-container-content pb-8">
        <div className="mx-auto max-w-reading">
          {plates.map((plate, index) => (
            <section
              // biome-ignore lint/suspicious/noArrayIndexKey: plates are positional
              key={index}
              aria-label={plate.heading ?? `Chapter ${index + 1}`}
              className="border-t border-gold/15 py-14 first:border-t-0 first:pt-6 md:py-20"
            >
              <p
                aria-hidden="true"
                className="font-serif text-sm tracking-[0.3em] text-gold-light"
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              {plate.heading ? (
                <h2 className="page-section-title mt-3 text-parchment">
                  {plate.heading}
                </h2>
              ) : null}
              <ReadingProse
                markdown={plate.body}
                dropCap={index === 0}
                className="mt-6 text-parchment/90 prose-p:text-parchment/90 prose-strong:text-gold-light"
              />
            </section>
          ))}
        </div>
      </article>

      {/* Finis */}
      <footer className="layout-container layout-container-content flex flex-col items-center pb-24 pt-8 text-center">
        <div
          className="flex items-center justify-center gap-4"
          aria-hidden="true"
        >
          <span className="h-px w-20 bg-gold/40" />
          <span className="font-serif text-xl text-parchment/85">Finis</span>
          <span className="h-px w-20 bg-gold/40" />
        </div>
        <Link
          href={backHref}
          className="mt-10 inline-flex min-h-11 items-center rounded-full border border-gold/40 px-6 type-ui text-gold-light transition-colors hover:bg-gold/10"
        >
          Sources and context for this myth
        </Link>
      </footer>
    </div>
  );
}
