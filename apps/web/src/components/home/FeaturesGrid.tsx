"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Gem,
  Globe,
  Map as MapIcon,
  Network,
  ScrollText,
  Skull,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Globe,
    title: "Start with Pantheons",
    description:
      "Get oriented fast by exploring the major myth traditions side by side",
    href: "/pantheons",
    iconBg: "from-[oklch(0.55_0.12_265)] to-[oklch(0.45_0.15_275)]",
    accent: "group-hover:text-[oklch(0.65_0.12_265)]",
  },
  {
    icon: Network,
    title: "Divine Family Trees",
    description:
      "Visualize complex relationships between gods and goddesses across generations",
    href: "/family-tree",
    iconBg: "from-[oklch(0.55_0.14_300)] to-[oklch(0.45_0.16_310)]",
    accent: "group-hover:text-[oklch(0.65_0.14_300)]",
  },
  {
    icon: ScrollText,
    title: "Read Core Stories",
    description:
      "Follow the myths and legends that make the gods, creatures, and places meaningful",
    href: "/stories",
    iconBg: "from-gold-dark to-bronze",
    accent: "group-hover:text-gold",
  },
  {
    icon: MapIcon,
    title: "Mythical Places",
    description:
      "Explore the real and mythical locations where these stories unfolded",
    href: "/locations",
    iconBg: "from-patina to-[oklch(0.45_0.10_170)]",
    accent: "group-hover:text-patina",
  },
  {
    icon: Skull,
    title: "Creatures & Monsters",
    description:
      "Face the legendary beasts and monsters that roam the mythological world",
    href: "/creatures",
    iconBg: "from-bronze to-[oklch(0.42_0.12_35)]",
    accent: "group-hover:text-bronze",
  },
  {
    icon: Gem,
    title: "Weapons & Artifacts",
    description:
      "Discover the powerful weapons and legendary objects forged by the gods",
    href: "/artifacts",
    iconBg: "from-midnight-light to-midnight",
    accent: "group-hover:text-midnight-light dark:group-hover:text-gold",
  },
];

export function FeaturesGrid() {
  return (
    <section className="relative py-28 bg-muted/30 noise-overlay overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-gold text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Explore
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-foreground">
            Discover Ancient Wisdom
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed">
            Start with the clearest entry points, then branch into deeper tools
            and interactive mythology features
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link href={feature.href} className="block h-full">
                <div className="group relative h-full p-6 rounded-xl bg-card border border-border/60 card-elevated overflow-hidden">
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-br from-gold/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-px h-8 bg-linear-to-b from-gold/30 to-transparent transform origin-top-right" />
                    <div className="absolute top-0 right-0 h-px w-8 bg-linear-to-l from-gold/30 to-transparent" />
                  </div>

                  {/* Icon */}
                  <div className="relative mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.iconBg} flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}
                    >
                      <feature.icon
                        className="h-7 w-7 text-white/90"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3
                    className={`font-serif text-xl font-semibold mb-3 text-foreground transition-colors duration-300 ${feature.accent}`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Link indicator */}
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground/70 group-hover:text-gold transition-colors duration-300">
                    <span>Explore</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
