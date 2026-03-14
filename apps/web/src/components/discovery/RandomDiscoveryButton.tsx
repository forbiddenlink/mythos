'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, X, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import deities from '@/data/deities.json';

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain?: string[];
  symbols?: string[];
  description?: string;
}

function getRandomDeity(exclude?: string): Deity {
  const available = exclude
    ? deities.filter((d) => d.id !== exclude)
    : deities;
  return available[Math.floor(Math.random() * available.length)] as Deity;
}

// Map common symbols to emoji for visual flair
const symbolEmoji: Record<string, string> = {
  thunderbolt: '⚡',
  lightning: '⚡',
  eagle: '🦅',
  sun: '☀️',
  moon: '🌙',
  star: '⭐',
  trident: '🔱',
  snake: '🐍',
  serpent: '🐍',
  wolf: '🐺',
  raven: '🪶',
  owl: '🦉',
  fire: '🔥',
  water: '💧',
  skull: '💀',
  crown: '👑',
  sword: '⚔️',
  hammer: '🔨',
  bow: '🏹',
  arrow: '🏹',
  wine: '🍷',
  grapes: '🍇',
  wheat: '🌾',
  flower: '🌸',
  lotus: '🪷',
  heart: '❤️',
  dove: '🕊️',
  horse: '🐴',
  bull: '🐂',
  lion: '🦁',
  cat: '🐱',
  scarab: '🪲',
  ankh: '☥',
  eye: '👁️',
  feather: '🪶',
  scale: '⚖️',
  tree: '🌳',
  oak: '🌳',
  mountain: '🏔️',
  sea: '🌊',
  ocean: '🌊',
  storm: '🌩️',
  thunder: '⛈️',
  death: '💀',
  war: '⚔️',
  love: '💕',
  beauty: '✨',
  wisdom: '📚',
  knowledge: '📖',
  music: '🎵',
  lyre: '🎵',
  caduceus: '⚕️',
  shield: '🛡️',
  spear: '🗡️',
  chariot: '🏎️',
  torch: '🔦',
  key: '🔑',
  mirror: '🪞',
  apple: '🍎',
  pomegranate: '🍎',
  peacock: '🦚',
  deer: '🦌',
  hound: '🐕',
  boar: '🐗',
  dragon: '🐉',
  phoenix: '🔥',
  crane: '🦢',
  ibis: '🦅',
  jackal: '🐕',
  falcon: '🦅',
  hawk: '🦅',
  crocodile: '🐊',
  cobra: '🐍',
  frog: '🐸',
  ram: '🐏',
};

function getSymbolEmoji(symbol: string): string | null {
  const lower = symbol.toLowerCase();
  // Direct match
  if (symbolEmoji[lower]) return symbolEmoji[lower];
  // Partial match
  for (const [key, emoji] of Object.entries(symbolEmoji)) {
    if (lower.includes(key) || key.includes(lower)) return emoji;
  }
  return null;
}

export function RandomDiscoveryButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [deity, setDeity] = useState<Deity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const discover = useCallback(() => {
    setIsSpinning(true);
    // Spin animation for 600ms, then reveal
    setTimeout(() => {
      setDeity(getRandomDeity(deity?.id));
      setIsSpinning(false);
    }, 600);
  }, [deity?.id]);

  const handleOpen = () => {
    setIsOpen(true);
    discover();
  };

  const handleClose = () => {
    setIsOpen(false);
    setDeity(null);
  };

  const pantheonName = deity?.pantheonId
    ?.replace('-pantheon', '')
    .replaceAll('-', ' ') || '';

  const domainText = deity?.domain?.slice(0, 3).join(', ') || '';

  const symbols = deity?.symbols?.slice(0, 4).map((s) => ({
    text: s,
    emoji: getSymbolEmoji(s),
  })) || [];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-gold to-amber-500 text-black font-semibold shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Discover a random deity"
      >
        <Shuffle className="h-5 w-5" />
        <span className="hidden sm:inline">Discover</span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          >
            {/* Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: isSpinning ? 360 : 0,
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 20,
                rotateY: { duration: 0.6 }
              }}
              className="relative w-full max-w-md bg-gradient-to-b from-card via-card to-gold/5 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Spinning State */}
              {isSpinning ? (
                <div className="h-80 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: 'linear', repeat: Infinity }}
                  >
                    <Sparkles className="h-16 w-16 text-gold" />
                  </motion.div>
                </div>
              ) : deity ? (
                <>
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <Badge
                      variant="outline"
                      className="text-xs capitalize border-gold/30 text-gold mb-3"
                    >
                      {pantheonName}
                    </Badge>
                    <h2 className="font-serif text-3xl font-bold mb-2">
                      {deity.name}
                    </h2>
                    {domainText && (
                      <p className="text-muted-foreground capitalize">
                        {domainText}
                      </p>
                    )}
                  </div>

                  {/* Symbols */}
                  {symbols.length > 0 && (
                    <div className="px-6 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {symbols.map((s, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-sm border border-gold/20"
                          >
                            {s.emoji && <span>{s.emoji}</span>}
                            <span className="capitalize">{s.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">
                      {deity.description || 'A deity from ancient mythology.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 pt-0">
                    <Button
                      variant="outline"
                      className="flex-1 border-gold/30 hover:bg-gold/10"
                      onClick={discover}
                    >
                      <Shuffle className="h-4 w-4 mr-2" />
                      Another
                    </Button>
                    <Button asChild className="flex-1 bg-gold hover:bg-gold/90 text-black">
                      <Link href={`/deities/${deity.slug}`} onClick={handleClose}>
                        Explore
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
