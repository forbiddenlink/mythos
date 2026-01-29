'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-[oklch(0.16_0.05_270)] to-midnight" />

      {/* Decorative radial gradient */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[60%] bg-gradient-radial from-gold/10 via-gold/5 to-transparent" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Top border line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Badge */}
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-6 font-medium">
            Start Exploring
          </span>

          {/* Heading */}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 text-parchment">
            Begin Your Journey Into
            <span className="block text-gradient-gold mt-2">Ancient Mythology</span>
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-2 h-2 rotate-45 bg-gold/50" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>

          {/* Description */}
          <p className="text-lg md:text-xl text-parchment/70 max-w-2xl mx-auto mb-12 font-body leading-relaxed">
            Explore the divine stories, legendary heroes, and timeless wisdom that shaped ancient civilizations across the world
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/deities"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-dark hover:from-gold hover:via-gold-light hover:to-gold text-midnight font-semibold transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30"
              >
                <Users className="h-5 w-5" strokeWidth={2} />
                Browse Deities
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/stories"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg border border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60 font-semibold transition-all duration-300"
              >
                <BookOpen className="h-5 w-5" strokeWidth={2} />
                Read Stories
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  );
}
