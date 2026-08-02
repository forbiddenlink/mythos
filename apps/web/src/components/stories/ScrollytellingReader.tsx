"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { getPantheonColor } from "@/lib/pantheon-colors";

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

export function ScrollytellingReader({
  title,
  narrative,
  pantheonId,
  pantheonName,
  imageUrl,
  backHref,
}: ScrollytellingReaderProps) {
  const reduce = useReducedMotion();
  const color = getPantheonColor(pantheonId);
  const plates = useMemo(() => splitIntoPlates(narrative), [narrative]);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Motion is opt-in: reduced-motion readers get a clean, fully-visible article.
  const plateMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 48 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-15% 0px -15% 0px" },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="relative bg-midnight text-parchment">
      {/* Reading progress rail — pantheon-tinted */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
        style={{ scaleX: progress, backgroundColor: color }}
      />

      {/* Persistent atmospheric backdrop */}
      <div className="fixed inset-0 -z-10">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.18]"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(1200px 800px at 50% 10%, ${color}22, transparent 60%), linear-gradient(to bottom, rgba(11,12,20,0.65), rgba(11,12,20,0.92))`,
          }}
        />
      </div>

      {/* Title plate */}
      <header className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Link
          href={backHref}
          className="absolute left-4 top-6 text-sm tracking-wide text-parchment/60 transition-colors hover:text-gold sm:left-8"
        >
          ← Back to the tale
        </Link>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <span
            className="mb-6 block text-xs uppercase tracking-[0.35em]"
            style={{ color }}
          >
            {pantheonName ? `${pantheonName} · A Reading` : "A Reading"}
          </span>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl leading-tight text-parchment sm:text-6xl">
            {title}
          </h1>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span
              className="h-px w-16"
              style={{ backgroundColor: `${color}80` }}
            />
            <span
              className="h-2 w-2 rotate-45"
              style={{ backgroundColor: color }}
            />
            <span
              className="h-px w-16"
              style={{ backgroundColor: `${color}80` }}
            />
          </div>
          <p className="mt-8 text-sm text-parchment/50">
            Scroll to unfold the myth
          </p>
        </motion.div>
      </header>

      {/* Story plates */}
      <div className="relative">
        {plates.map((plate, index) => (
          <section
            key={index}
            className="flex min-h-screen items-center justify-center px-6 py-24"
          >
            <motion.article
              {...plateMotion}
              className="w-full max-w-[64ch] rounded-2xl border border-gold/15 bg-midnight/60 p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-12"
            >
              <span
                aria-hidden
                className="mb-6 block font-serif text-sm tracking-widest"
                style={{ color: `${color}cc` }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {plate.heading ? (
                <h2 className="mb-6 font-serif text-2xl text-gold sm:text-3xl">
                  {plate.heading}
                </h2>
              ) : null}
              <div className="prose prose-invert prose-gold max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-parchment/90 prose-strong:text-gold/80 prose-blockquote:border-l-gold/40 prose-blockquote:text-parchment/70">
                <ReactMarkdown>{plate.body}</ReactMarkdown>
              </div>
            </motion.article>
          </section>
        ))}
      </div>

      {/* Finis */}
      <footer className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <span
            className="h-px w-20"
            style={{ backgroundColor: `${color}66` }}
          />
          <span className="font-serif text-xl" style={{ color }}>
            Finis
          </span>
          <span
            className="h-px w-20"
            style={{ backgroundColor: `${color}66` }}
          />
        </div>
        <p className="mt-6 text-sm text-parchment/50">
          Thus concludes the tale.
        </p>
        <Link
          href={backHref}
          className="mt-10 rounded-full border border-gold/30 px-6 py-2 text-sm text-gold transition-colors hover:bg-gold/10"
        >
          Return to the reference page
        </Link>
      </footer>
    </div>
  );
}

export default ScrollytellingReader;
