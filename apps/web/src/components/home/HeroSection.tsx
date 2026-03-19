"use client";

import { TransitionLink } from "@/components/transitions";
import { Button } from "@/components/ui/button";
import deitiesData from "@/data/deities.json";
import pantheonData from "@/data/pantheons.json";
import storiesData from "@/data/stories.json";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Compass, Globe2, Sparkles, Users } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic imports for heavy 3D/particle components
const ConstellationBackground = dynamic(
  () =>
    import("@/components/three/ConstellationBackground").then(
      (mod) => mod.ConstellationBackground,
    ),
  { ssr: false },
);

const GoldenDustParticles = dynamic(
  () =>
    import("@/components/effects/DomainParticles").then(
      (mod) => mod.GoldenDustParticles,
    ),
  { ssr: false },
);

const STATS = {
  pantheons: (pantheonData as unknown[]).length,
  deities: (deitiesData as unknown[]).length,
  stories: (storiesData as unknown[]).length,
} as const;

const startPaths = [
  {
    title: "Start with a pantheon",
    description: "Learn the major gods and story world first.",
    href: "/pantheons",
  },
  {
    title: "Read a first myth",
    description: "Jump into the stories before the reference material.",
    href: "/stories",
  },
  {
    title: "Test yourself",
    description: "Use quizzes and review to make what you learn stick.",
    href: "/quiz",
  },
] as const;

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient noise-overlay">
      {/* Interactive 3D constellation background */}
      <ConstellationBackground />

      {/* Golden dust particles */}
      <GoldenDustParticles className="z-5" />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-linear-to-b from-midnight/60 via-midnight/40 to-midnight"></div>
      </div>

      {/* Radial gradient light source - like candlelight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-[rgba(178,143,86,0.15)] via-[rgba(178,143,86,0.05)] to-transparent" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[rgba(10,10,25,0.5)]" />

      {/* Floating orbs - disabled for users who prefer reduced motion */}
      {!shouldReduceMotion && (
        <>
          <motion.div
            className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(178,143,86,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.6, 0.4],
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-[20%] right-[8%] w-96 h-96 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(98,87,150,0.1) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -25, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
          <motion.div
            className="absolute top-[50%] right-[25%] w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(140,95,60,0.08) 0%, transparent 70%)",
              filter: "blur(35px)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.25, 0.4, 0.25],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
          />
        </>
      )}

      {/* Decorative lines - classical aesthetic */}
      <div className="absolute top-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Decorative emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className="absolute -inset-5 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(178,143,86,0.2) 0%, transparent 70%)",
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Icon container with ornate border */}
            <div className="relative p-5 rounded-full border border-gold/30 bg-linear-to-br from-midnight-light/80 to-midnight/90 backdrop-blur-sm">
              <div className="absolute inset-1 rounded-full border border-gold/10" />
              <Compass
                className="h-10 w-10 text-gold animate-glow"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </motion.div>

        {/* Main title with refined typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="block text-gold/80 text-sm tracking-[0.4em] uppercase mb-4 font-sans font-medium">
            Encyclopedia of Ancient Mythology
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-semibold tracking-tight mb-6"
        >
          <span className="text-gradient-hero">Mythos Atlas</span>
        </motion.h1>

        {/* Decorative divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="w-16 md:w-24 h-px bg-linear-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
          <div className="w-16 md:w-24 h-px bg-linear-to-l from-transparent to-gold/40" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl lg:text-2xl text-parchment/80 max-w-2xl mx-auto mb-6 font-body leading-relaxed tracking-wide"
        >
          A free interactive encyclopedia of mythology from {STATS.pantheons}{" "}
          civilizations &mdash; with family trees, quizzes, and AI&#8209;powered
          exploration.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <Button
            asChild
            size="lg"
            className="relative overflow-hidden bg-linear-to-r from-gold-dark via-gold to-gold-dark hover:from-gold hover:via-gold-light hover:to-gold text-midnight font-semibold px-10 py-6 text-base tracking-wide transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30"
          >
            <TransitionLink href="/pantheons">
              Explore Mythologies
            </TransitionLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-gold/40 bg-transparent text-gold hover:bg-gold/10 hover:border-gold/60 px-10 py-6 text-base tracking-wide transition-all duration-300"
          >
            <TransitionLink href="/stories">Read a First Myth</TransitionLink>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.72 }}
          className="max-w-4xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/15 bg-midnight-light/20 text-gold/80 text-xs uppercase tracking-[0.24em] mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Choose your first path
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-left">
            {startPaths.map((path) => (
              <TransitionLink
                key={path.href}
                href={path.href}
                className="group rounded-2xl border border-gold/15 bg-midnight-light/25 backdrop-blur-sm px-5 py-4 hover:border-gold/35 hover:bg-midnight-light/35 transition-all duration-300"
              >
                <div className="text-parchment font-semibold mb-1 group-hover:text-gold transition-colors duration-300">
                  {path.title}
                </div>
                <p className="text-sm text-parchment/60 leading-relaxed">
                  {path.description}
                </p>
              </TransitionLink>
            ))}
          </div>
        </motion.div>

        {/* Proof strip — stats + credibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-2xl mx-auto mb-24"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-5">
            {[
              { icon: Globe2, value: STATS.pantheons, label: "Pantheons" },
              { icon: Users, value: `${STATS.deities}+`, label: "Deities" },
              { icon: BookOpen, value: `${STATS.stories}+`, label: "Stories" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gold/15 bg-midnight-light/30 backdrop-blur-sm"
              >
                <stat.icon className="h-4 w-4 text-gold/70" strokeWidth={1.5} />
                <span className="text-gold font-semibold font-serif tabular-nums">
                  {stat.value}
                </span>
                <span className="text-parchment/60 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
          <p className="text-parchment/40 text-xs tracking-wide">
            Based on the Eddas, Theogony, Popol Vuh, and other primary sources
            &middot; Always free
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-gold/40 text-xs tracking-[0.2em] uppercase font-sans">
              Scroll
            </span>
            <svg
              className="w-5 h-5 text-gold/40"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
