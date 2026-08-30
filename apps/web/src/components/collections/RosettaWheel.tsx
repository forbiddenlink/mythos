"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getPantheonColor } from "@/lib/pantheon-colors";

function prettyFromPantheonId(pantheonId: string): string {
  return pantheonId
    .replace(/-pantheon$/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export interface WheelDeity {
  name: string;
  slug: string;
  pantheonId: string;
}

/**
 * The Rosetta Wheel — one archetype at the centre, its parallel deities from
 * different pantheons arranged around a ring, each joined to the centre by a
 * thread in its pantheon's colour. Turns "the same role across cultures" into
 * a single readable image. Pure SVG + CSS (no WebGL); the underlying content
 * is a set of real deity links, so it stays accessible.
 */
export function RosettaWheel({
  archetype,
  deities,
}: {
  archetype: string;
  deities: WheelDeity[];
}) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  // De-dupe + cap so the ring never overcrowds.
  const members = deities
    .filter((d, i, arr) => arr.findIndex((x) => x.slug === d.slug) === i)
    .slice(0, 12);

  if (members.length < 2) return null;

  const R = 39; // ring radius in % of the box
  const points = members.map((d, i) => {
    const angle = (-90 + (i * 360) / members.length) * (Math.PI / 180);
    return {
      ...d,
      x: 50 + R * Math.cos(angle),
      y: 50 + R * Math.sin(angle),
      color: getPantheonColor(d.pantheonId),
    };
  });

  return (
    <section className="mb-12" aria-label={`${archetype} across pantheons`}>
      <div className="mb-6">
        <span className="text-xs uppercase tracking-[0.25em] text-gold/80">
          One role, many cultures
        </span>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          The {archetype} archetype across pantheons
        </h2>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
        {/* threads */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {points.map((p, i) => (
            <line
              key={p.slug}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={p.color}
              strokeWidth={active === i ? 0.9 : 0.4}
              strokeOpacity={active === null || active === i ? 0.8 : 0.2}
              style={{ transition: "all 0.25s ease" }}
            />
          ))}
        </svg>

        {/* centre seal */}
        <div className="absolute left-1/2 top-1/2 flex size-[24%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-midnight/90 text-center shadow-lg shadow-black/30">
          <span className="px-2 font-serif text-sm leading-tight text-gold md:text-base">
            {archetype}
          </span>
        </div>

        {/* medallions */}
        {points.map((p, i) => (
          <motion.div
            key={p.slug}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05 }}
          >
            <Link
              href={`/deities/${p.slug}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group flex w-24 flex-col items-center gap-1 rounded-md text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
            >
              <span
                className="flex size-11 items-center justify-center rounded-full border-2 bg-midnight/80 font-serif text-lg text-parchment transition-transform duration-200 group-hover:scale-110 group-focus-visible:scale-110"
                style={{ borderColor: p.color }}
              >
                {p.name.charAt(0)}
              </span>
              <span className="text-xs font-medium text-foreground group-hover:text-gold">
                {p.name}
              </span>
              <span
                className="text-[0.6rem] uppercase tracking-wider"
                style={{ color: p.color }}
              >
                {prettyFromPantheonId(p.pantheonId)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default RosettaWheel;
