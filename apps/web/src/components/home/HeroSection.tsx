'use client';

import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { TransitionLink } from '@/components/transitions';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const mythologyQuotes = [
  { text: "In the beginning was the Word, and the Word was with God...", source: "Various Mythologies" },
  { text: "The gods envy us. They envy us because we're mortal.", source: "Achilles, Greek Mythology" },
  { text: "Know thyself.", source: "Temple of Apollo, Delphi" },
  { text: "Even the gods cannot change the past.", source: "Agathon" },
];

export function HeroSection() {
  // Use deterministic quote on server, then randomize on client
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuoteIndex(Math.floor(Math.random() * mythologyQuotes.length));
  }, []);

  const randomQuote = mythologyQuotes[quoteIndex];

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] z-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/hero-columns.webp')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/60 via-midnight/40 to-midnight"></div>
      </div>

      {/* Radial gradient light source - like candlelight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-radial from-[rgba(178,143,86,0.15)] via-[rgba(178,143,86,0.05)] to-transparent" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[rgba(10,10,25,0.5)]" />

      {/* Floating orbs - more subtle and elegant */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-80 h-80 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(178,143,86,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
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
          background: 'radial-gradient(circle, rgba(98,87,150,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
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
          background: 'radial-gradient(circle, rgba(140,95,60,0.08) 0%, transparent 70%)',
          filter: 'blur(35px)',
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

      {/* Decorative lines - classical aesthetic */}
      <div className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-8 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

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
              className="absolute inset-[-20px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(178,143,86,0.2) 0%, transparent 70%)',
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
            <div className="relative p-5 rounded-full border border-gold/30 bg-gradient-to-br from-midnight-light/80 to-midnight/90 backdrop-blur-sm">
              <div className="absolute inset-1 rounded-full border border-gold/10" />
              <Compass className="h-10 w-10 text-gold animate-glow" strokeWidth={1.5} />
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
          <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-gold/40" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
          <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-gold/40" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl lg:text-2xl text-parchment/80 max-w-2xl mx-auto mb-12 font-body leading-relaxed tracking-wide"
        >
          Journey through the ancient stories, divine beings, and sacred wisdom that shaped civilizations across the ages
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
            className="relative overflow-hidden bg-gradient-to-r from-gold-dark via-gold to-gold-dark hover:from-gold hover:via-gold-light hover:to-gold text-midnight font-semibold px-10 py-6 text-base tracking-wide transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30"
          >
            <TransitionLink href="/pantheons">
              Explore Mythologies
            </TransitionLink>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 px-10 py-6 text-base tracking-wide transition-all duration-300"
          >
            <TransitionLink href="/deities">
              Meet the Gods
            </TransitionLink>
          </Button>
        </motion.div>

        {/* Quote block with refined styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-xl mx-auto mb-24"
        >
          <div className="relative p-8 rounded-lg border border-gold/10 bg-midnight-light/30 backdrop-blur-sm">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/30" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/30" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/30" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/30" />

            <p className="text-gold-light/90 italic text-lg font-body leading-relaxed mb-3">
              &ldquo;{randomQuote.text}&rdquo;
            </p>
            <p className="text-parchment/50 text-sm font-sans tracking-wide">
              — {randomQuote.source}
            </p>
          </div>
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
            <span className="text-gold/40 text-xs tracking-[0.2em] uppercase font-sans">Scroll</span>
            <svg className="w-5 h-5 text-gold/40" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
