'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Globe, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const pantheons = [
  {
    name: 'Greek Pantheon',
    slug: 'greek',
    culture: 'Ancient Greek',
    description: 'The Olympian gods who ruled from Mount Olympus',
    color: 'from-blue-600 to-cyan-600',
    textColor: 'text-blue-100',
  },
  {
    name: 'Norse Pantheon',
    slug: 'norse',
    culture: 'Norse/Germanic',
    description: 'The Æsir and Vanir of Asgard and the Nine Worlds',
    color: 'from-slate-600 to-slate-800',
    textColor: 'text-slate-100',
  },
  {
    name: 'Egyptian Pantheon',
    slug: 'egyptian',
    culture: 'Ancient Egyptian',
    description: 'The divine rulers of the Nile Valley and the afterlife',
    color: 'from-amber-600 to-orange-700',
    textColor: 'text-amber-100',
  },
];

export function PantheonShowcase() {
  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            Featured Pantheons
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Begin your journey with these foundational mythologies
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pantheons.map((pantheon, index) => (
            <motion.div
              key={pantheon.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/pantheons/${pantheon.slug}`}>
                <Card className={`h-full transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer border-0 bg-gradient-to-br ${pantheon.color} text-white overflow-hidden group`}>
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                        <Globe className="h-6 w-6" />
                      </div>
                      <CardTitle className={`font-serif text-2xl ${pantheon.textColor}`}>
                        {pantheon.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className={`text-sm ${pantheon.textColor} mb-2 font-medium`}>
                      {pantheon.culture}
                    </p>
                    <p className="text-white/90 mb-4">
                      {pantheon.description}
                    </p>
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline" className="border-slate-300 dark:border-slate-700">
            <Link href="/pantheons">
              View All Pantheons
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
