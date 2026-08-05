"use client";

import { useRef, useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { TransitionLink } from "@/components/transitions";
import { MythosMark } from "@/components/icons/mythos-marks";
import { HeroMark } from "@/components/icons/hero-mark";
import { getPantheonColor } from "@/lib/pantheon-colors";
import pantheonData from "@/data/pantheons.json";
import deitiesData from "@/data/deities.json";
import storiesData from "@/data/stories.json";
import dynamic from "next/dynamic";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ConstellationBackground = dynamic(
  () =>
    import("@/components/three/ConstellationBackground").then(
      (mod) => mod.ConstellationBackground,
    ),
  { ssr: false },
);

const STATS = {
  pantheons: (pantheonData as unknown[]).length,
  deities: (deitiesData as unknown[]).length,
  stories: (storiesData as unknown[]).length,
} as const;

const PULL_QUOTE = {
  text: "And Zeus, when he had stilled the wrath of gods and men, the high-throned Son of Cronos dwelling in the heavens…",
  source: "Hesiod, Theogony",
  href: "/deities/zeus",
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

interface PantheonRow {
  id: string;
  name: string;
  slug: string;
}

/**
 * "The Atlas Opens" — pinned scroll-scrubbed homepage signature
 * (portfolio elevation Phase 1). Falls back to a static rest state
 * under prefers-reduced-motion.
 */
export function AtlasOpensHero() {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [showDecor, setShowDecor] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const pantheons = pantheonData as PantheonRow[];

  useEffect(() => {
    if (reduce) return;
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(() => setShowDecor(true), { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setShowDecor(true), 400);
    return () => window.clearTimeout(id);
  }, [reduce]);

  useEffect(() => {
    if (reduce || !pinRef.current) return;
    const el = pinRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { rootMargin: "10% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  useGSAP(
    () => {
      if (reduce || !pinRef.current || !rootRef.current) return;

      const scenes = gsap.utils.toArray<HTMLElement>(
        pinRef.current.querySelectorAll("[data-atlas-scene]"),
      );
      if (scenes.length < 2) return;

      gsap.set(scenes, { autoAlpha: 0 });
      gsap.set(scenes[0], { autoAlpha: 1 });
      // Drop FOUC-only utilities; GSAP autoAlpha owns visibility afterward
      scenes.forEach((scene) => {
        scene.classList.remove("pointer-events-none", "invisible", "opacity-0");
        scene.removeAttribute("aria-hidden");
      });
      scenes[0]?.removeAttribute("aria-hidden");
      scenes
        .slice(1)
        .forEach((scene) => scene.setAttribute("aria-hidden", "true"));

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          // Longer scrub distance = less sticky scene-to-scene jumps
          end: "+=420%",
          scrub: 1.35,
          pin: pinRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              scenes.length - 1,
              Math.floor(self.progress * scenes.length),
            );
            scenes.forEach((scene, i) => {
              if (i === idx) scene.removeAttribute("aria-hidden");
              else scene.setAttribute("aria-hidden", "true");
            });
          },
        },
      });

      scenes.forEach((scene, i) => {
        if (i === 0) return;
        const prev = scenes[i - 1];
        const at = (i - 1) * 1.15;
        tl.to(
          prev,
          { autoAlpha: 0, y: -8, duration: 0.6, ease: "power1.inOut" },
          at,
        ).fromTo(
          scene,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" },
          at + 0.15,
        );
      });

      const sigils = pinRef.current.querySelectorAll("[data-sigil]");
      if (sigils.length) {
        gsap.fromTo(
          sigils,
          { y: 14, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.03,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top+=30% top",
              end: "top+=58% top",
              scrub: 1.2,
            },
          },
        );
      }
    },
    { scope: rootRef, dependencies: [reduce] },
  );

  const restContent = (
    <div className="relative z-10 container mx-auto px-4 text-center py-16">
      <div className="flex justify-center mb-8">
        <HeroMark mark="compass" tone="gold" size="lg" />
      </div>
      <span className="block text-gold/80 text-sm tracking-[0.4em] uppercase mb-4 font-sans font-medium">
        Encyclopedia of Ancient Mythology
      </span>
      <h1 className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight mb-6">
        <span className="text-gold-text drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)]">
          Mythos Atlas
        </span>
      </h1>
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="w-16 md:w-24 h-px bg-linear-to-r from-transparent to-gold/40" />
        <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
        <div className="w-16 md:w-24 h-px bg-linear-to-l from-transparent to-gold/40" />
      </div>
      <p className="text-lg md:text-xl text-parchment/90 max-w-2xl mx-auto mb-6 font-body leading-relaxed">
        A free study atlas of mythology from {STATS.pantheons} civilizations —
        family trees, quizzes, and connected reference pages that help what you
        learn stick.
      </p>
      <div className="max-w-4xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gold/25 bg-midnight/50 text-gold/90 text-xs uppercase tracking-[0.24em] mb-5">
          <MythosMark id="constellation" className="h-3.5 w-3.5" />
          Choose your first path
        </div>
        <div className="grid gap-3 md:grid-cols-3 text-left">
          {startPaths.map((path) => (
            <TransitionLink
              key={path.href}
              href={path.href}
              className="group border border-gold/30 bg-midnight/55 backdrop-blur-md px-5 py-4 hover:border-gold/55 hover:-translate-y-0.5 hover:bg-midnight/70 transition-[colors,transform,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            >
              <div className="text-parchment font-semibold mb-1 group-hover:text-gold">
                {path.title}
              </div>
              <p className="text-sm text-parchment/85 leading-relaxed">
                {path.description}
              </p>
            </TransitionLink>
          ))}
        </div>
      </div>
      <dl className="flex flex-wrap justify-center gap-8 text-parchment/80">
        {[
          ["Pantheons", STATS.pantheons],
          ["Deities", STATS.deities],
          ["Stories", STATS.stories],
        ].map(([label, value]) => (
          <div key={label as string} className="text-center">
            <dt className="text-xs uppercase tracking-[0.2em] text-gold/70">
              {label}
            </dt>
            <dd className="font-serif text-3xl text-parchment">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  if (reduce) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient noise-overlay">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-linear-to-b from-midnight/60 via-midnight/40 to-midnight" />
        </div>
        {restContent}
      </section>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={pinRef}
        className="relative h-screen overflow-hidden bg-hero-gradient noise-overlay"
      >
        {showDecor && (
          <ConstellationBackground
            contained
            active={heroInView}
            className="absolute inset-0 z-0 pointer-events-none"
          />
        )}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-linear-to-b from-midnight/70 via-midnight/45 to-midnight" />
        </div>

        {/* Scene 1 — Cosmos / wordmark (visible before GSAP hydrates) */}
        <div
          data-atlas-scene
          className="absolute inset-0 z-10 flex items-center justify-center px-4"
        >
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <HeroMark mark="compass" tone="gold" size="lg" />
            </div>
            <span className="block text-gold/80 text-sm tracking-[0.4em] uppercase mb-4">
              The atlas opens
            </span>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight">
              <span className="text-gold-text drop-shadow-[0_2px_20px_rgba(0,0,0,0.45)]">
                Mythos Atlas
              </span>
            </h1>
            <p className="mt-6 text-parchment/70 text-sm tracking-[0.2em] uppercase">
              Scroll to descend through the cultures
            </p>
          </div>
        </div>

        {/* Scene 2 — Culture sigils (hidden until scrub; avoids stacked FOUC) */}
        <div
          data-atlas-scene
          className="absolute inset-0 z-10 flex items-center justify-center px-4 opacity-0 invisible pointer-events-none"
          aria-hidden
        >
          <div className="w-full max-w-5xl text-center">
            <p className="mb-8 text-xs uppercase tracking-[0.3em] text-gold/80">
              Thirteen civilizations
            </p>
            <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
              {pantheons.map((p) => (
                <li key={p.id} data-sigil>
                  <Link
                    href={`/pantheons/${p.slug}`}
                    className="inline-flex items-center gap-2 border border-gold/25 bg-midnight/60 px-3 py-2 text-sm text-parchment hover:border-gold/50 hover:text-gold transition-colors"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: getPantheonColor(p.id) }}
                      aria-hidden
                    />
                    {p.name.replace(" Pantheon", "").replace(" (Yoruba)", "")}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Scene 3 — Featured myth pull-quote */}
        <div
          data-atlas-scene
          className="absolute inset-0 z-10 flex items-center justify-center px-4 opacity-0 invisible pointer-events-none"
          aria-hidden
        >
          <blockquote className="max-w-3xl text-center">
            <MythosMark
              id="scroll"
              className="mx-auto mb-6 h-6 w-6 text-gold/70"
            />
            <p className="font-serif text-2xl md:text-3xl leading-relaxed text-parchment">
              “{PULL_QUOTE.text}”
            </p>
            <footer className="mt-6 text-sm tracking-wide text-gold/80">
              — {PULL_QUOTE.source} ·{" "}
              <Link
                href={PULL_QUOTE.href}
                className="underline-offset-4 hover:underline"
              >
                Meet Zeus
              </Link>
            </footer>
          </blockquote>
        </div>

        {/* Scene 4 — Rest / CTAs */}
        <div
          data-atlas-scene
          className="absolute inset-0 z-10 overflow-y-auto overscroll-contain opacity-0 invisible pointer-events-none"
          aria-hidden
        >
          {restContent}
        </div>
      </div>
    </div>
  );
}

export default AtlasOpensHero;
