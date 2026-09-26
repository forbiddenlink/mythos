"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";

export interface StoryScene {
  id: string;
  title?: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  mood?: "calm" | "dramatic" | "mysterious" | "triumphant" | "tragic";
  backgroundColor?: string;
}

interface CinematicStoryProps {
  title: string;
  scenes: StoryScene[];
  className?: string;
}

// Mood to gradient mapping
const moodGradients: Record<string, string> = {
  calm: "from-midnight via-midnight-light to-midnight",
  dramatic: "from-red-950 via-slate-900 to-orange-950",
  mysterious: "from-midnight via-bronze/30 to-midnight",
  triumphant: "from-midnight via-gold/20 to-midnight",
  tragic: "from-gray-950 via-slate-900 to-zinc-950",
  default: "from-midnight via-slate-900 to-midnight-light",
};

function Scene({ scene, index }: { scene: StoryScene; index: number }) {
  const sceneRef = useRef<HTMLDivElement>(null);

  const gradient = moodGradients[scene.mood || "default"];

  // Parallax: the background image settles from 1.05x to 1x as the scene
  // scrolls from entering the viewport ("start end") to its centre reaching
  // the viewport centre ("center center"). The spring smooths the scrubbed
  // value; reduced-motion users get a static image.
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "center center"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const scale = useTransform(smoothProgress, [0, 1], [1.05, 1]);

  return (
    <section
      ref={sceneRef}
      id={`scene-${scene.id}`}
      className={`min-h-screen relative overflow-hidden flex items-center justify-center py-20 bg-gradient-to-b ${gradient}`}
    >
      {/* Background image with parallax */}
      {scene.imageUrl && (
        <motion.div
          className="absolute inset-0 z-0"
          style={reduceMotion ? undefined : { scale }}
        >
          <Image
            src={scene.imageUrl}
            alt={scene.imageAlt || scene.title || "Story scene"}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
        </motion.div>
      )}

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-6 relative z-10">
        <div className="text-center">
          {scene.title && (
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-gold mb-8">
              {scene.title}
            </h2>
          )}

          <div className="prose prose-lg prose-invert mx-auto">
            <p className="text-xl md:text-2xl text-parchment/90 leading-relaxed font-body">
              {scene.text}
            </p>
          </div>

          {/* Scene indicator */}
          <div className="mt-12 flex justify-center gap-2">
            <span className="text-gold/50 text-sm font-sans tracking-wider">
              Scene {index + 1}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative divider at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}

export function CinematicStory({
  title,
  scenes,
  className = "",
}: CinematicStoryProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Story Title */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-midnight to-slate-900 relative overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze/20 rounded-full blur-3xl" />
        </div>

        <div className="min-w-0 max-w-full text-center relative z-10 px-6">
          <div>
            <span className="text-gold/60 text-sm tracking-[0.3em] uppercase font-sans mb-6 block">
              An Ancient Tale
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-parchment mb-8">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="w-16 h-px bg-gold/40" />
              <div className="w-2 h-2 rotate-45 bg-gold/60" />
              <div className="w-16 h-px bg-gold/40" />
            </div>
            <p className="text-parchment/60 text-lg">
              Scroll to begin the journey
            </p>
            <div className="mt-8" aria-hidden="true">
              <svg
                className="w-6 h-6 text-gold/50 mx-auto"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Story Scenes */}
      {scenes.map((scene, index) => (
        <Scene key={scene.id} scene={scene} index={index} />
      ))}

      {/* Story End */}
      <section className="min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-slate-900 to-midnight">
        <div className="min-w-0 max-w-full text-center px-6">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-px bg-gold/40" />
            <span className="text-gold font-serif text-xl">Finis</span>
            <div className="w-24 h-px bg-gold/40" />
          </div>
          <p className="text-parchment/60 text-sm">Thus concludes the tale</p>
        </div>
      </section>
    </div>
  );
}
