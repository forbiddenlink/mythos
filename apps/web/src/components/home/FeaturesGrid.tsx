'use client';

import { motion } from 'framer-motion';
import { Globe, Network, ScrollText, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Globe,
    title: 'Explore Pantheons',
    description: 'Discover mythological traditions from ancient civilizations around the world',
    href: '/pantheons',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Network,
    title: 'Divine Family Trees',
    description: 'Visualize complex relationships between gods and goddesses across generations',
    href: '/family-tree',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: ScrollText,
    title: 'Epic Stories',
    description: 'Read the myths and legends that defined cultures and inspired countless retellings',
    href: '/stories',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: MapIcon,
    title: 'Sacred Geography',
    description: 'Explore the real and mythical locations where these stories unfolded',
    href: '/map',
    color: 'from-green-500 to-emerald-500',
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            Discover Ancient Wisdom
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore the interconnected web of deities, stories, and sacred places through interactive visualizations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="h-full transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="font-serif text-xl text-slate-900 dark:text-slate-100">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
