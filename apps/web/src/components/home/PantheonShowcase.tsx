"use client";

import { TransitionLink } from "@/components/transitions";
import { Button } from "@/components/ui/button";
import {
  mythosMarks,
  type MythosMarkId,
} from "@/components/icons/mythos-marks";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

// Hardcoded for now to match the "Featured" style, but updated to include more
const pantheons = [
  {
    name: "Greek",
    fullName: "Greek Pantheon",
    slug: "greek",
    culture: "Ancient Greek",
    description:
      "The Olympian gods who ruled from Mount Olympus, shaping the fate of mortals and heroes alike.",
    mark: "temple" as MythosMarkId,
    gradient:
      "from-[oklch(0.45_0.12_265)] via-[oklch(0.50_0.10_255)] to-[oklch(0.40_0.14_275)]",
    accentColor: "bg-[oklch(0.60_0.12_265)]",
  },
  {
    name: "Norse",
    fullName: "Norse Pantheon",
    slug: "norse",
    culture: "Norse/Germanic",
    description:
      "The Æsir and Vanir of Asgard, warriors and seers across the Nine Worlds.",
    mark: "tree" as MythosMarkId,
    gradient:
      "from-[oklch(0.28_0.04_265)] via-[oklch(0.32_0.03_260)] to-[oklch(0.25_0.05_270)]",
    accentColor: "bg-[oklch(0.50_0.04_265)]",
  },
  {
    name: "Egyptian",
    fullName: "Egyptian Pantheon",
    slug: "egyptian",
    culture: "Ancient Egyptian",
    description:
      "The divine rulers of the Nile Valley, guardians of life, death, and rebirth.",
    mark: "chronos" as MythosMarkId,
    gradient:
      "from-[oklch(0.32_0.08_70)] via-[oklch(0.24_0.06_65)] to-[oklch(0.16_0.04_55)]",
    accentColor: "bg-gold",
  },
  {
    name: "Roman",
    fullName: "Roman Pantheon",
    slug: "roman",
    culture: "Ancient Roman",
    description:
      "The deities of the Roman state, emphasizing duty, discipline, and the glory of the Empire.",
    mark: "temple" as MythosMarkId,
    gradient:
      "from-[oklch(0.35_0.1_30)] via-[oklch(0.28_0.08_35)] to-[oklch(0.22_0.05_40)]",
    accentColor: "bg-[oklch(0.5_0.12_35)]",
  },
  {
    name: "Hindu",
    fullName: "Hindu Pantheon",
    slug: "hindu",
    culture: "Vedic/Hindu",
    description:
      "The diverse family of gods centered on the Trimurti, governing dharma and karma.",
    mark: "torch" as MythosMarkId,
    gradient:
      "from-[oklch(0.38_0.1_55)] via-[oklch(0.3_0.08_70)] to-[oklch(0.22_0.06_45)]",
    accentColor: "bg-[oklch(0.62_0.14_70)]",
  },
  {
    name: "Japanese",
    fullName: "Japanese Pantheon",
    slug: "japanese",
    culture: "Shinto",
    description:
      "The Kami of nature and ancestors, inhabiting the islands and shrines of Japan.",
    mark: "peak" as MythosMarkId,
    gradient:
      "from-[oklch(0.32_0.1_25)] via-[oklch(0.24_0.06_30)] to-[oklch(0.16_0.03_50)]",
    accentColor: "bg-[oklch(0.55_0.14_30)]",
  },
];

// Show a focused set on the homepage — full list is on /pantheons
const HOMEPAGE_PANTHEON_COUNT = 6;

export function PantheonShowcase() {
  return (
    <section className="relative py-28 bg-background noise-overlay">
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-gold text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Begin Your Journey
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-foreground">
            Featured Pantheons
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed">
            Explore these foundational mythologies that shaped civilizations
          </p>
        </motion.div>

        {/* Pantheon cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14 max-w-6xl mx-auto">
          {pantheons
            .slice(0, HOMEPAGE_PANTHEON_COUNT)
            .map((pantheon, index) => (
              <motion.div
                key={pantheon.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TransitionLink
                  href={`/pantheons/${pantheon.slug}`}
                  className="block h-full group"
                >
                  <div
                    className={`relative h-full rounded-xl overflow-hidden bg-linear-to-br ${pantheon.gradient} p-px`}
                  >
                    {/* Inner card */}
                    <div className="relative h-full rounded-[11px] bg-linear-to-br from-black/55 via-black/45 to-black/65 backdrop-blur-sm p-6 flex flex-col overflow-hidden">
                      <Image
                        src={`/pantheons/${pantheon.slug}.png`}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover opacity-25 mix-blend-luminosity pointer-events-none"
                        aria-hidden
                      />
                      {/* Decorative corner */}
                      <div className="absolute top-3 right-3 z-10 w-8 h-8 border-t border-r border-white/10 rounded-tr-lg" />

                      {/* Classical mark */}
                      <div className="relative z-10 mb-5">
                        {(() => {
                          const Mark = mythosMarks[pantheon.mark];
                          return (
                            <div className="inline-flex items-center justify-center w-12 h-12 border border-white/15 bg-black/25">
                              <Mark className="h-7 w-7 text-gold" />
                            </div>
                          );
                        })()}
                      </div>

                      {/* Title */}
                      <div className="relative z-10 mb-4">
                        <span className="text-xs text-white/50 tracking-widest uppercase block mb-1">
                          {pantheon.culture}
                        </span>
                        <h3 className="font-serif text-2xl font-semibold text-white tracking-wide">
                          {pantheon.fullName}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="relative z-10 text-white/85 text-sm leading-relaxed mb-6 grow">
                        {pantheon.description}
                      </p>

                      {/* CTA */}
                      <div className="relative z-10 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors duration-300">
                        <span className="text-sm font-medium tracking-wide">
                          Explore Pantheon
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>

                      {/* Hover shine effect */}
                      <div className="absolute inset-0 z-10 bg-linear-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[11px]" />
                    </div>
                  </div>
                </TransitionLink>
              </motion.div>
            ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border hover:border-gold/50 hover:bg-gold/5 px-8 transition-all duration-300"
          >
            <TransitionLink href="/pantheons">
              View All Pantheons
              <ArrowRight className="ml-2 h-4 w-4" />
            </TransitionLink>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
