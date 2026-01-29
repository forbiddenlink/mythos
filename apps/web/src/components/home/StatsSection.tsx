'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Users, BookOpen, Globe2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const stats = [
  {
    icon: Globe2,
    value: 8,
    suffix: '+',
    label: 'Pantheons',
    description: 'From Greek to Norse to Egyptian',
  },
  {
    icon: Users,
    value: 100,
    suffix: '+',
    label: 'Deities',
    description: 'Gods and goddesses across cultures',
  },
  {
    icon: BookOpen,
    value: 200,
    suffix: '+',
    label: 'Stories',
    description: 'Epic myths and legends',
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const controls = animate(0, value, {
              duration: 2,
              ease: [0.22, 1, 0.36, 1],
              onUpdate: (v) => setDisplayValue(Math.round(v)),
            });
            return () => controls.stop();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {displayValue}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight via-midnight-light/95 to-midnight" />

      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B28F56' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block text-gold/80 text-sm tracking-[0.25em] uppercase mb-4 font-medium">
            Our Collection
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-5 text-parchment">
            A Living Encyclopedia
          </h2>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-gold/50" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold/40" />
          </div>
          <p className="text-lg text-parchment/60 max-w-2xl mx-auto font-body leading-relaxed">
            Carefully curated from historical texts and archaeological findings
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative text-center group"
            >
              {/* Card background */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative py-8 px-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gold/10 border border-gold/20 mb-6 group-hover:bg-gold/15 group-hover:border-gold/30 transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-gold" strokeWidth={1.5} />
                </div>

                {/* Value */}
                <div className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-3 text-gradient-gold">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="text-xl font-serif font-medium mb-2 text-parchment/90 tracking-wide">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-sm text-parchment/50 font-body">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
