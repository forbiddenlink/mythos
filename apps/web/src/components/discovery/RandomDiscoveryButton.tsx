"use client";

import { useState, useCallback, useContext } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { MythosMark } from "@/components/icons/mythos-marks";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressContext } from "@/providers/progress-provider";
import deities from "@/data/deities.json";

interface Deity {
  id: string;
  name: string;
  slug: string;
  pantheonId: string;
  domain?: string[];
  symbols?: string[];
  description?: string;
}

/** Prefer unvisited deities and cold pantheons (skill-mapper decay pattern). */
function pickDiscoveryDeity(
  exclude: string | undefined,
  viewedIds: string[],
  exploredPantheons: string[],
): Deity {
  const viewed = new Set(viewedIds);
  const coldPantheons = new Set(
    [...new Set((deities as Deity[]).map((d) => d.pantheonId))].filter(
      (p) => !exploredPantheons.includes(p),
    ),
  );

  const pool = (deities as Deity[]).filter((d) => d.id !== exclude);

  const unvisitedCold = pool.filter(
    (d) => !viewed.has(d.id) && coldPantheons.has(d.pantheonId),
  );
  if (unvisitedCold.length > 0) {
    return unvisitedCold[Math.floor(Math.random() * unvisitedCold.length)];
  }

  const unvisited = pool.filter((d) => !viewed.has(d.id));
  if (unvisited.length > 0 && Math.random() < 0.7) {
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

// Map common symbols to emoji for visual flair
const symbolEmoji: Record<string, string> = {
  thunderbolt: "⚡",
  lightning: "⚡",
  eagle: "🦅",
  sun: "☀️",
  moon: "🌙",
  star: "⭐",
  trident: "🔱",
  snake: "🐍",
  serpent: "🐍",
  wolf: "🐺",
  raven: "🪶",
  owl: "🦉",
  fire: "🔥",
  water: "💧",
  skull: "💀",
  crown: "👑",
  sword: "⚔️",
  hammer: "🔨",
  bow: "🏹",
  arrow: "🏹",
  wine: "🍷",
  grapes: "🍇",
  wheat: "🌾",
  flower: "🌸",
  lotus: "🪷",
  heart: "❤️",
  dove: "🕊️",
  horse: "🐴",
  bull: "🐂",
  lion: "🦁",
  cat: "🐱",
  scarab: "🪲",
  ankh: "☥",
  eye: "👁️",
  feather: "🪶",
  scale: "⚖️",
  tree: "🌳",
  oak: "🌳",
  mountain: "🏔️",
  sea: "🌊",
  ocean: "🌊",
  storm: "🌩️",
  thunder: "⛈️",
  death: "💀",
  war: "⚔️",
  love: "💕",
  beauty: "✨",
  wisdom: "📚",
  knowledge: "📖",
  music: "🎵",
  lyre: "🎵",
  caduceus: "⚕️",
  shield: "🛡️",
  spear: "🗡️",
  chariot: "🏎️",
  torch: "🔦",
  key: "🔑",
  mirror: "🪞",
  apple: "🍎",
  pomegranate: "🍎",
  peacock: "🦚",
  deer: "🦌",
  hound: "🐕",
  boar: "🐗",
  dragon: "🐉",
  phoenix: "🔥",
  crane: "🦢",
  ibis: "🦅",
  jackal: "🐕",
  falcon: "🦅",
  hawk: "🦅",
  crocodile: "🐊",
  cobra: "🐍",
  frog: "🐸",
  ram: "🐏",
};

function getSymbolEmoji(symbol: string): string | null {
  const lower = symbol.toLowerCase();
  if (symbolEmoji[lower]) return symbolEmoji[lower];
  for (const [key, emoji] of Object.entries(symbolEmoji)) {
    if (lower.includes(key) || key.includes(lower)) return emoji;
  }
  return null;
}

export function RandomDiscoveryButton() {
  const progress = useContext(ProgressContext);
  const [isOpen, setIsOpen] = useState(false);
  const [deity, setDeity] = useState<Deity | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const discover = useCallback(() => {
    setIsSpinning(true);
    setTimeout(() => {
      const next = pickDiscoveryDeity(
        deity?.id,
        progress?.progress.deitiesViewed ?? [],
        progress?.progress.pantheonsExplored ?? [],
      );
      setDeity(next);
      setIsSpinning(false);
    }, 600);
  }, [
    deity?.id,
    progress?.progress.deitiesViewed,
    progress?.progress.pantheonsExplored,
  ]);

  const handleOpen = () => {
    setIsOpen(true);
    discover();
  };

  const handleClose = () => {
    setIsOpen(false);
    setDeity(null);
  };

  const pantheonName =
    deity?.pantheonId?.replace("-pantheon", "").replaceAll("-", " ") || "";

  const domainText = deity?.domain?.slice(0, 3).join(", ") || "";

  const symbols =
    deity?.symbols?.slice(0, 4).map((s) => ({
      text: s,
      emoji: getSymbolEmoji(s),
    })) || [];

  return (
    <>
      {/* Floating Button — hidden on small screens to avoid crowding with cookie banner */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-2 px-4 py-3 rounded-lg border border-gold/40 bg-midnight/90 text-gold font-semibold shadow-lg shadow-midnight/40 backdrop-blur-sm hover:border-gold hover:bg-midnight transition-[border-color,background-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Discover a random deity"
      >
        <MythosMark id="lot" className="h-5 w-5" />
        <span className="hidden sm:inline tracking-wide">Discover</span>
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
                type: "spring",
                damping: 20,
                rotateY: { duration: 0.6 },
              }}
              className="relative w-full max-w-md bg-gradient-to-b from-card via-card to-gold/5 border border-gold/30 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-sm bg-background/50 hover:bg-background/80 transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Spinning State */}
              {isSpinning ? (
                <div className="h-80 flex items-center justify-center">
                  <motion.div
                    animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : { duration: 0.6, ease: "linear", repeat: Infinity }
                    }
                  >
                    <MythosMark
                      id="constellation"
                      className="h-16 w-16 text-gold"
                    />
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gold/10 text-sm border border-gold/20"
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
                      {deity.description || "A deity from ancient mythology."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 p-6 pt-0">
                    <Button
                      variant="outline"
                      className="flex-1 border-gold/30 hover:bg-gold/10"
                      onClick={discover}
                    >
                      <MythosMark id="lot" className="h-4 w-4 mr-2" />
                      Another
                    </Button>
                    <Button
                      asChild
                      className="flex-1 bg-gold hover:bg-gold/90 text-black"
                    >
                      <Link
                        href={`/deities/${deity.slug}`}
                        onClick={handleClose}
                      >
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
