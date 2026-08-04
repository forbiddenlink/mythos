"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  type MythosMarkId,
  mythosMarks,
} from "@/components/icons/mythos-marks";

const features: {
  mark: MythosMarkId;
  title: string;
  description: string;
  href: string;
  number: string;
}[] = [
  {
    mark: "temple",
    title: "Start with Pantheons",
    description:
      "Orient yourself in a tradition before diving into individual gods and myths.",
    href: "/pantheons",
    number: "I",
  },
  {
    mark: "scroll",
    title: "Read Core Stories",
    description:
      "Follow the narratives that give deities, creatures, and places their meaning.",
    href: "/stories",
    number: "II",
  },
  {
    mark: "tree",
    title: "Divine Family Trees",
    description:
      "Trace parentage, rivals, and consorts across generations in one view.",
    href: "/family-tree",
    number: "III",
  },
  {
    mark: "peak",
    title: "Mythical Places",
    description:
      "Map sacred geography — from Olympus to the Nine Realms and beyond.",
    href: "/locations",
    number: "IV",
  },
  {
    mark: "serpent",
    title: "Creatures & Monsters",
    description:
      "Study the beasts that test heroes and define each culture’s dangers.",
    href: "/creatures",
    number: "V",
  },
  {
    mark: "relic",
    title: "Weapons & Artifacts",
    description:
      "Inspect legendary objects forged by gods and carried through myth.",
    href: "/artifacts",
    number: "VI",
  },
];

export function FeaturesGrid() {
  const [featured, ...rest] = features;
  const FeaturedMark = mythosMarks[featured.mark];

  return (
    <section className="relative py-28 bg-muted/30 noise-overlay overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-16"
        >
          <span className="inline-block text-gold text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Ways in
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-foreground max-w-xl">
            Six clear paths through the atlas
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-gold/40 to-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl font-body leading-relaxed">
            Begin with a culture or a story, then branch into trees, places, and
            artifacts when you want more depth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <Link
            href={featured.href}
            className="group block border-y border-gold/25 py-8 md:py-10"
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
              <span className="font-serif text-5xl md:text-6xl text-gold/40 leading-none tabular-nums">
                {featured.number}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 text-gold">
                  <FeaturedMark className="h-6 w-6" />
                  <span className="text-xs uppercase tracking-[0.2em] text-gold/80">
                    Recommended first
                  </span>
                </div>
                <h3 className="font-serif text-3xl md:text-4xl font-semibold text-foreground group-hover:text-gold transition-colors duration-300">
                  {featured.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
                  {featured.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-gold transition-colors">
                Open
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        </motion.div>

        <ol className="divide-y divide-border/70 border-b border-border/70">
          {rest.map((feature, index) => {
            const Mark = mythosMarks[feature.mark];
            return (
              <motion.li
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={feature.href}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 py-5 md:py-6"
                >
                  <span className="w-10 shrink-0 font-serif text-xl text-gold/50">
                    {feature.number}
                  </span>
                  <Mark className="hidden sm:block h-5 w-5 shrink-0 text-muted-foreground group-hover:text-gold transition-colors" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
