"use client";

import { TransitionLink } from "@/components/transitions";
import { Button } from "@/components/ui/button";
import {
  mythosMarks,
  type MythosMarkId,
} from "@/components/icons/mythos-marks";
import { getPantheonColor } from "@/lib/pantheon-colors";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pantheons: {
  name: string;
  fullName: string;
  slug: string;
  pantheonId: string;
  culture: string;
  description: string;
  mark: MythosMarkId;
}[] = [
  {
    name: "Greek",
    fullName: "Greek Pantheon",
    slug: "greek",
    pantheonId: "greek-pantheon",
    culture: "Ancient Greek",
    description:
      "The Olympian gods who ruled from Mount Olympus, shaping the fate of mortals and heroes alike.",
    mark: "temple",
  },
  {
    name: "Norse",
    fullName: "Norse Pantheon",
    slug: "norse",
    pantheonId: "norse-pantheon",
    culture: "Norse/Germanic",
    description:
      "The Æsir and Vanir of Asgard, warriors and seers across the Nine Worlds.",
    mark: "tree",
  },
  {
    name: "Egyptian",
    fullName: "Egyptian Pantheon",
    slug: "egyptian",
    pantheonId: "egyptian-pantheon",
    culture: "Ancient Egyptian",
    description:
      "The divine rulers of the Nile Valley, guardians of life, death, and rebirth.",
    mark: "chronos",
  },
  {
    name: "Roman",
    fullName: "Roman Pantheon",
    slug: "roman",
    pantheonId: "roman-pantheon",
    culture: "Ancient Roman",
    description:
      "The deities of the Roman state, emphasizing duty, discipline, and the glory of the Empire.",
    mark: "temple",
  },
  {
    name: "Hindu",
    fullName: "Hindu Pantheon",
    slug: "hindu",
    pantheonId: "hindu-pantheon",
    culture: "Vedic/Hindu",
    description:
      "The diverse family of gods centered on the Trimurti, governing dharma and karma.",
    mark: "torch",
  },
  {
    name: "Japanese",
    fullName: "Japanese Pantheon",
    slug: "japanese",
    pantheonId: "japanese-pantheon",
    culture: "Shinto",
    description:
      "The Kami of nature and ancestors, inhabiting the islands and shrines of Japan.",
    mark: "peak",
  },
];

const HOMEPAGE_PANTHEON_COUNT = 6;

export function PantheonShowcase() {
  const featured = pantheons.slice(0, HOMEPAGE_PANTHEON_COUNT);
  const [lead, ...rest] = featured;

  return (
    <section className="relative py-28 bg-background noise-overlay">
      <div className="container mx-auto px-4 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-16"
        >
          <span className="inline-block text-gold text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Begin your journey
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-foreground max-w-xl">
            Featured Pantheons
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-gold/40 to-transparent" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl font-body leading-relaxed">
            Orient in a tradition first — then branch into gods, myths, and
            sacred geography.
          </p>
        </motion.div>

        {lead && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4"
          >
            <TransitionLink
              href={`/pantheons/${lead.slug}`}
              className="group block border-y border-gold/25 py-8 md:py-10"
            >
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                <span
                  className="size-3 shrink-0 rounded-full md:mb-2"
                  style={{ backgroundColor: getPantheonColor(lead.pantheonId) }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {lead.culture}
                  </span>
                  <h3 className="mt-2 font-serif text-3xl md:text-4xl font-semibold text-foreground group-hover:text-gold transition-colors duration-300">
                    {lead.fullName}
                  </h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
                    {lead.description}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground group-hover:text-gold transition-colors">
                  Explore
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </TransitionLink>
          </motion.div>
        )}

        <ol className="divide-y divide-border/70 border-b border-border/70 mb-14">
          {rest.map((pantheon, index) => {
            const Mark = mythosMarks[pantheon.mark];
            return (
              <motion.li
                key={pantheon.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TransitionLink
                  href={`/pantheons/${pantheon.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-5 md:py-6"
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: getPantheonColor(pantheon.pantheonId),
                    }}
                    aria-hidden
                  />
                  <Mark className="hidden sm:block h-5 w-5 shrink-0 text-muted-foreground group-hover:text-gold transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {pantheon.culture}
                    </p>
                    <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-gold transition-colors">
                      {pantheon.fullName}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {pantheon.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </TransitionLink>
              </motion.li>
            );
          })}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
