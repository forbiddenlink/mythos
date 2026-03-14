'use client';

import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface StoryScene {
  id: string;
  title?: string;
  text: string;
  imageUrl?: string;
  imageAlt?: string;
  mood?: 'calm' | 'dramatic' | 'mysterious' | 'triumphant' | 'tragic';
  backgroundColor?: string;
}

interface CinematicStoryProps {
  title: string;
  scenes: StoryScene[];
  className?: string;
}

// Mood to gradient mapping
const moodGradients: Record<string, string> = {
  calm: 'from-blue-950 via-slate-900 to-indigo-950',
  dramatic: 'from-red-950 via-slate-900 to-orange-950',
  mysterious: 'from-purple-950 via-slate-900 to-violet-950',
  triumphant: 'from-amber-950 via-slate-900 to-yellow-950',
  tragic: 'from-gray-950 via-slate-900 to-zinc-950',
  default: 'from-midnight via-slate-900 to-midnight-light',
};

function Scene({ scene, index }: { scene: StoryScene; index: number }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const gradient = moodGradients[scene.mood || 'default'];

  useGSAP(() => {
    if (!sceneRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sceneRef.current,
        start: 'top 80%',
        end: 'center center',
        scrub: 1,
      },
    });

    // Animate text
    if (textRef.current) {
      tl.fromTo(
        textRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
        0
      );
    }

    // Animate image with parallax
    if (imageRef.current) {
      tl.fromTo(
        imageRef.current,
        { scale: 1.1, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 1.2 },
        0
      );
    }
  }, { scope: sceneRef });

  return (
    <section
      ref={sceneRef}
      id={`scene-${scene.id}`}
      className={`min-h-screen relative flex items-center justify-center py-20 bg-gradient-to-b ${gradient}`}
    >
      {/* Background image with parallax */}
      {scene.imageUrl && (
        <div
          ref={imageRef}
          className="absolute inset-0 z-0"
        >
          <Image
            src={scene.imageUrl}
            alt={scene.imageAlt || scene.title || 'Story scene'}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50" />
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto max-w-3xl px-6 relative z-10">
        <div ref={textRef} className="text-center">
          {scene.title && (
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-serif text-3xl md:text-4xl lg:text-5xl text-gold mb-8"
            >
              {scene.title}
            </motion.h2>
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

export function CinematicStory({ title, scenes, className = '' }: CinematicStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup ScrollTrigger on unmount
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Story Title */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-midnight to-slate-900 relative overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        </div>

        <div className="text-center relative z-10 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <span className="text-gold/60 text-sm tracking-[0.3em] uppercase font-sans mb-6 block">
              An Ancient Tale
            </span>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-parchment mb-8">
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
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-8"
            >
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Scenes */}
      {scenes.map((scene, index) => (
        <Scene key={scene.id} scene={scene} index={index} />
      ))}

      {/* Story End */}
      <section className="min-h-[50vh] flex items-center justify-center bg-gradient-to-b from-slate-900 to-midnight">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center px-6"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-24 h-px bg-gold/40" />
            <span className="text-gold font-serif text-xl">Finis</span>
            <div className="w-24 h-px bg-gold/40" />
          </div>
          <p className="text-parchment/60 text-sm">
            Thus concludes the tale
          </p>
        </motion.div>
      </section>
    </div>
  );
}

export default CinematicStory;
