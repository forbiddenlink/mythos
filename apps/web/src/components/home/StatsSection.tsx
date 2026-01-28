'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Globe2 } from 'lucide-react';

const stats = [
  {
    icon: Globe2,
    value: '8+',
    label: 'Pantheons',
    description: 'From Greek to Norse to Egyptian',
  },
  {
    icon: Users,
    value: '100+',
    label: 'Deities',
    description: 'Gods and goddesses across cultures',
  },
  {
    icon: BookOpen,
    value: '200+',
    label: 'Stories',
    description: 'Epic myths and legends',
  },
];

export function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
            A Living Encyclopedia
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Carefully curated from historical texts and archaeological findings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 mb-4">
                <stat.icon className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-amber-200 to-orange-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-2xl font-semibold mb-2 text-slate-200">
                {stat.label}
              </div>
              <div className="text-slate-400">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
