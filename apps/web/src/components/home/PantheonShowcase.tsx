'use client';

import { motion } from 'framer-motion';
import { TransitionLink } from '@/components/transitions';
import { Columns, Compass, Pyramid, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Hardcoded for now to match the "Featured" style, but updated to include more
const pantheons = [
  {
    name: 'Greek',
    fullName: 'Greek Pantheon',
    slug: 'greek',
    culture: 'Ancient Greek',
    description: 'The Olympian gods who ruled from Mount Olympus, shaping the fate of mortals and heroes alike.',
    icon: Columns,
    gradient: 'from-[oklch(0.45_0.12_265)] via-[oklch(0.50_0.10_255)] to-[oklch(0.40_0.14_275)]',
    accentColor: 'bg-[oklch(0.60_0.12_265)]',
  },
  {
    name: 'Norse',
    fullName: 'Norse Pantheon',
    slug: 'norse',
    culture: 'Norse/Germanic',
    description: 'The Æsir and Vanir of Asgard, warriors and seers across the Nine Worlds.',
    icon: Compass,
    gradient: 'from-[oklch(0.28_0.04_265)] via-[oklch(0.32_0.03_260)] to-[oklch(0.25_0.05_270)]',
    accentColor: 'bg-[oklch(0.50_0.04_265)]',
  },
  {
    name: 'Egyptian',
    fullName: 'Egyptian Pantheon',
    slug: 'egyptian',
    culture: 'Ancient Egyptian',
    description: 'The divine rulers of the Nile Valley, guardians of life, death, and rebirth.',
    icon: Pyramid,
    gradient: 'from-gold-dark via-gold to-bronze',
    accentColor: 'bg-gold',
  },
  {
    name: 'Roman',
    fullName: 'Roman Pantheon',
    slug: 'roman',
    culture: 'Ancient Roman',
    description: 'The deities of the Roman state, emphasizing duty, discipline, and the glory of the Empire.',
    icon: Columns,
    gradient: 'from-red-900 via-red-800 to-orange-900',
    accentColor: 'bg-red-700',
  },
  {
    name: 'Hindu',
    fullName: 'Hindu Pantheon',
    slug: 'hindu',
    culture: 'Vedic/Hindu',
    description: 'The diverse family of gods centered on the Trimurti, governing dharma and karma.',
    icon: Columns, // Using generic icon
    gradient: 'from-orange-600 via-amber-500 to-yellow-600',
    accentColor: 'bg-orange-500',
  },
  {
    name: 'Japanese',
    fullName: 'Japanese Pantheon',
    slug: 'japanese',
    culture: 'Shinto',
    description: 'The Kami of nature and ancestors, inhabiting the islands and shrines of Japan.',
    icon: Columns, // Using generic icon
    gradient: 'from-red-600 via-pink-600 to-white',
    accentColor: 'bg-red-600',
  },
  {
    name: 'Celtic',
    fullName: 'Celtic Pantheon',
    slug: 'celtic',
    culture: 'Celtic',
    description: 'The gods of nature, magic, and sovereignty from Ireland, Wales, and Gaul.',
    icon: Compass,
    gradient: 'from-green-700 via-emerald-600 to-lime-600',
    accentColor: 'bg-green-600',
  },
  {
    name: 'Aztec',
    fullName: 'Aztec Pantheon',
    slug: 'aztec',
    culture: 'Aztec/Nahua',
    description: 'The sun-soaked, blood-nourished gods of the Mexica, maintaining the cosmic cycle.',
    icon: Pyramid,
    gradient: 'from-red-600 via-orange-600 to-yellow-500',
    accentColor: 'bg-red-600',
  },
  {
    name: 'Chinese',
    fullName: 'Chinese Pantheon',
    slug: 'chinese',
    culture: 'Chinese',
    description: 'The celestial bureaucracy of gods, immortals, and spirits governing heaven and earth.',
    icon: Columns,
    gradient: 'from-red-800 via-yellow-700 to-red-900',
    accentColor: 'bg-red-800',
  },
];

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
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed">
            Explore these foundational mythologies that shaped civilizations
          </p>
        </motion.div>

        {/* Pantheon cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14 max-w-6xl mx-auto">
          {pantheons.map((pantheon, index) => (
            <motion.div
              key={pantheon.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <TransitionLink href={`/pantheons/${pantheon.slug}`} className="block h-full group">
                <div className={`relative h-full rounded-xl overflow-hidden bg-gradient-to-br ${pantheon.gradient} p-px`}>
                  {/* Inner card */}
                  <div className="relative h-full rounded-[11px] bg-gradient-to-br from-black/40 via-black/20 to-black/50 backdrop-blur-sm p-6 flex flex-col">
                    {/* Decorative corner */}
                    <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-white/10 rounded-tr-lg" />

                    {/* Icon */}
                    <div className="mb-5">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${pantheon.accentColor}/20 border border-white/10`}>
                        <pantheon.icon className="h-6 w-6 text-white/80" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="mb-4">
                      <span className="text-xs text-white/50 tracking-widest uppercase block mb-1">
                        {pantheon.culture}
                      </span>
                      <h3 className="font-serif text-2xl font-semibold text-white tracking-wide">
                        {pantheon.fullName}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow">
                      {pantheon.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-medium tracking-wide">Explore Pantheon</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[11px]" />
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
