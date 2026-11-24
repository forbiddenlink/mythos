"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MythosMark, type MythosMarkId } from "@/components/icons/mythos-marks";
import {
  Trophy,
  RefreshCw,
  Timer,
  Sparkles,
  Grid3X3,
  Crown,
  Zap,
} from "lucide-react";
import { shuffle } from "@/lib/shuffle";
import { thumbHashToBlurDataURL } from "@/lib/thumbhash-data-url";

export interface MemoryGameDeity {
  id: string;
  name: string;
  symbols: string[];
  pantheonId: string;
  imageUrl?: string | null;
  blurHash?: string;
}

interface MemoryCard {
  id: string;
  type: "symbol" | "deity";
  content: string;
  displayContent: string;
  markId?: MythosMarkId;
  imageUrl?: string | null;
  blurHash?: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { pairs: number; label: string; gridCols: string }
> = {
  easy: { pairs: 6, label: "Easy", gridCols: "grid-cols-3 sm:grid-cols-4" },
  medium: { pairs: 8, label: "Medium", gridCols: "grid-cols-4" },
  hard: { pairs: 12, label: "Hard", gridCols: "grid-cols-4 sm:grid-cols-6" },
};

// Symbol to classical MythosMark mapping (no OS emoji)
const SYMBOL_MARK: Record<string, MythosMarkId> = {
  thunderbolt: "bolt",
  lightning: "bolt",
  eagle: "owl",
  falcon: "owl",
  owl: "owl",
  raven: "owl",
  ravens: "owl",
  ibis: "owl",
  dove: "owl",
  peacock: "owl",
  "oak tree": "tree",
  "olive tree": "tree",
  "cypress tree": "tree",
  cypress: "tree",
  mistletoe: "tree",
  myrtle: "myrtle",
  rose: "myrtle",
  pomegranate: "myrtle",
  lotus: "myrtle",
  narcissus: "myrtle",
  apple: "myrtle",
  grape: "wheat",
  ivy: "wheat",
  thyrsus: "wheat",
  wheat: "wheat",
  grain: "wheat",
  corn: "wheat",
  laurel: "laurel",
  diadem: "scepter",
  crown: "scepter",
  scepter: "scepter",
  ring: "scepter",
  crook: "scepter",
  flail: "scepter",
  trident: "trident",
  dolphin: "trident",
  ship: "compass",
  chariot: "compass",
  "winged sandals": "compass",
  spear: "blade",
  sword: "blade",
  mace: "blade",
  axe: "blade",
  "bow and arrow": "blade",
  bow: "blade",
  aegis: "relic",
  shield: "relic",
  helmet: "relic",
  mirror: "relic",
  necklace: "relic",
  conch: "relic",
  discus: "relic",
  lyre: "lyre",
  sistrum: "lyre",
  flute: "lyre",
  drum: "lyre",
  "theater mask": "lyre",
  sun: "chronos",
  moon: "constellation",
  gold: "constellation",
  frost: "constellation",
  ice: "constellation",
  torch: "torch",
  fire: "torch",
  hearth: "torch",
  "eternal flame": "torch",
  caduceus: "staff",
  staff: "staff",
  ankh: "staff",
  runes: "codex",
  scroll: "scroll",
  book: "codex",
  hammer: "anvil",
  anvil: "anvil",
  tongs: "anvil",
  loom: "labyrinth",
  spiders: "labyrinth",
  web: "labyrinth",
  key: "urn",
  skull: "urn",
  "mummified form": "urn",
  "three-headed dog": "urn",
  serpent: "serpent",
  snake: "serpent",
  crocodile: "serpent",
  scales: "scales",
  feather: "scales",
  eye: "constellation",
  scarab: "chronos",
  horn: "relic",
  "drinking horn": "relic",
  skis: "peak",
  mountain: "peak",
};

function getSymbolMark(symbol: string): MythosMarkId {
  const normalized = symbol.toLowerCase();
  if (SYMBOL_MARK[normalized]) return SYMBOL_MARK[normalized];
  for (const [key, mark] of Object.entries(SYMBOL_MARK)) {
    if (normalized.includes(key)) return mark;
  }
  return "relic";
}

function getSymbolDisplay(symbol: string): string {
  return symbol.charAt(0).toUpperCase() + symbol.slice(1);
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getCardBorderClasses(card: MemoryCard): string {
  if (card.isMatched)
    return "border-green-500/50 bg-green-500/10 cursor-default";
  if (card.isFlipped) return "border-gold/50 bg-gold/10 cursor-default";
  return "border-gold/25 bg-midnight bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklch,var(--gold)_16%,transparent),transparent_65%)] hover:border-gold/70 cursor-pointer active:scale-95";
}

function getCardAriaLabel(card: MemoryCard): string {
  const contentLabel =
    card.type === "symbol" ? `Symbol: ${card.content}` : card.content;
  if (card.isMatched) return `Matched: ${contentLabel}`;
  if (card.isFlipped) return contentLabel;
  return "Face down card";
}

function getEfficiencyMessage(efficiency: number): string {
  if (efficiency >= 80)
    return "Remarkable memory! The gods themselves would be impressed.";
  if (efficiency >= 60)
    return "Well done! You honor the ancient symbols with your recall.";
  return "The symbols reveal themselves to those who practice. Try again!";
}

export function SymbolMemoryGame({
  deities,
}: {
  /** id / name / symbols / pantheonId for every deity, from the server page. */
  deities: MemoryGameDeity[];
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>(
    {
      easy: null,
      medium: null,
      hard: null,
    },
  );
  const [isChecking, setIsChecking] = useState(false);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load best times from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mythos_memory_best_times");
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
        return;
      const record = parsed as Record<string, unknown>;
      const valid = (["easy", "medium", "hard"] as const).every(
        (key) =>
          record[key] === null ||
          (typeof record[key] === "number" &&
            Number.isSafeInteger(record[key]) &&
            record[key] >= 0),
      );
      if (valid) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate validated local scores
        setBestTimes({
          easy: record.easy,
          medium: record.medium,
          hard: record.hard,
        } as Record<Difficulty, number | null>);
      }
    } catch {
      // Storage may be unavailable; the game still works without saved scores.
    }
  }, []);

  useEffect(
    () => () => {
      if (mismatchTimer.current !== null) clearTimeout(mismatchTimer.current);
    },
    [],
  );

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameCompleted || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  const initializeGame = useCallback(() => {
    if (mismatchTimer.current !== null) {
      clearTimeout(mismatchTimer.current);
      mismatchTimer.current = null;
    }
    const config = DIFFICULTY_CONFIG[difficulty];

    // Filter deities that have symbols
    const deitiesWithSymbols = deities.filter(
      (deity) => (deity.symbols?.length ?? 0) > 0,
    );

    // Shuffle and pick deities for the game
    const selectedDeities = shuffle(deitiesWithSymbols).slice(0, config.pairs);

    // Create card pairs
    const cardPairs: MemoryCard[] = [];
    selectedDeities.forEach((deity) => {
      const pairId = deity.id;
      const primarySymbol = deity.symbols[0];

      // Symbol card
      cardPairs.push({
        id: `${deity.id}-symbol`,
        type: "symbol",
        content: primarySymbol,
        displayContent: getSymbolDisplay(primarySymbol),
        markId: getSymbolMark(primarySymbol),
        pairId,
        isFlipped: false,
        isMatched: false,
      });

      // Deity name card
      cardPairs.push({
        id: `${deity.id}-deity`,
        type: "deity",
        content: deity.name,
        displayContent: deity.name,
        imageUrl: deity.imageUrl,
        blurHash: deity.blurHash,
        pairId,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle all cards
    setCards(shuffle(cardPairs));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsChecking(false);
  }, [deities, difficulty]);

  // Initialize game when data loads or difficulty changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deal a fresh board when data loads or difficulty changes
    initializeGame();
  }, [difficulty, initializeGame]);

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Start game timer on first click
    if (!gameStarted) {
      setGameStarted(true);
      // eslint-disable-next-line react-hooks/purity -- Date.now() is only called in event handler, not during render
      setStartTime(Date.now());
    }

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
    );

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsChecking(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found
        setCards((prev) =>
          prev.map((c) =>
            c.id === firstId || c.id === secondId
              ? { ...c, isMatched: true }
              : c,
          ),
        );
        setMatches((prev) => prev + 1);
        setFlippedCards([]);
        setIsChecking(false);

        // Check for game completion
        const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
        if (matches + 1 === totalPairs) {
          setGameCompleted(true);
          // eslint-disable-next-line react-hooks/purity -- Called in event handler, not during render
          const now = Date.now();
          const finalTime = Math.floor((now - (startTime || now)) / 1000);
          setElapsedTime(finalTime);

          // Update best time
          if (
            bestTimes[difficulty] === null ||
            finalTime < bestTimes[difficulty]!
          ) {
            const newBestTimes = { ...bestTimes, [difficulty]: finalTime };
            setBestTimes(newBestTimes);
            try {
              localStorage.setItem(
                "mythos_memory_best_times",
                JSON.stringify(newBestTimes),
              );
            } catch {
              // Keep the completed game usable when storage is unavailable.
            }
          }
        }
      } else {
        // No match - flip cards back after delay
        mismatchTimer.current = setTimeout(() => {
          mismatchTimer.current = null;
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isFlipped: false }
                : c,
            ),
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  if (gameCompleted) {
    const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
    const perfectMoves = totalPairs;
    const efficiency = Math.round((perfectMoves / moves) * 100);
    const isBestTime = bestTimes[difficulty] === elapsedTime;

    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-6 p-6 rounded-full bg-linear-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
            <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-serif">
            Memory Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              {isBestTime && "New Best Time!"}
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center p-3 rounded-lg bg-muted/50 w-28">
              <div className="text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" /> Moves
              </div>
              <div className="font-bold text-lg">{moves}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 w-28">
              <div className="text-muted-foreground mb-1 flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" /> Efficiency
              </div>
              <div className="font-bold text-lg">{efficiency}%</div>
            </div>
            {bestTimes[difficulty] && (
              <div className="text-center p-3 rounded-lg w-28 border border-gold/20 bg-gold/5">
                <div className="text-gold/80 mb-1 flex items-center justify-center gap-1">
                  <Crown className="h-3 w-3" /> Best
                </div>
                <div className="font-bold text-lg text-gold">
                  {formatTime(bestTimes[difficulty]!)}
                </div>
              </div>
            )}
          </div>

          <div className="text-center max-w-sm mx-auto">
            <p className="text-lg">{getEfficiencyMessage(efficiency)}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={initializeGame}
              className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black"
            >
              <RefreshCw className="h-5 w-5" />
              Play Again
            </Button>
            <Button
              onClick={() => {
                const difficulties: Difficulty[] = ["easy", "medium", "hard"];
                const currentIndex = difficulties.indexOf(difficulty);
                const nextDifficulty =
                  difficulties[(currentIndex + 1) % difficulties.length];
                setDifficulty(nextDifficulty);
              }}
              variant="outline"
              className="flex-1 h-12 text-lg gap-2"
            >
              <Grid3X3 className="h-5 w-5" />
              Change Difficulty
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <Timer
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span
              className="font-mono text-lg font-semibold"
              aria-label={`Time: ${formatTime(elapsedTime)}`}
            >
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <Sparkles
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="font-semibold" aria-label={`Moves: ${moves}`}>
              {moves} moves
            </span>
          </div>
          <output
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold-text"
            aria-label={`Matches: ${matches} of ${config.pairs}`}
          >
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">
              {matches}/{config.pairs}
            </span>
          </output>
        </div>

        <div className="flex items-center gap-2">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <Button
              key={diff}
              variant={difficulty === diff ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(diff)}
              className={
                difficulty === diff ? "bg-gold hover:bg-gold/90 text-black" : ""
              }
            >
              {DIFFICULTY_CONFIG[diff].label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            aria-label="Reset game"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className={`grid ${config.gridCols} gap-3 max-w-4xl mx-auto`}
        role="group"
        aria-label="Memory game board"
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched || isChecking}
                className={`
                  aspect-square w-full rounded-xl border-2 transition-all duration-300
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                  ${getCardBorderClasses(card)}
                `}
                aria-label={getCardAriaLabel(card)}
                aria-pressed={card.isFlipped ? "true" : "false"}
              >
                <AnimatePresence mode="wait">
                  {card.isFlipped || card.isMatched ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: -90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex flex-col items-center justify-center p-2"
                    >
                      {card.type === "symbol" ? (
                        <>
                          <span
                            className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 sm:size-14"
                            aria-hidden="true"
                          >
                            <MythosMark
                              id={card.markId ?? "relic"}
                              className="size-6 text-gold-text sm:size-8"
                            />
                          </span>
                          <span className="mt-2 line-clamp-2 px-1 text-center font-serif text-xs font-medium capitalize text-foreground sm:text-sm">
                            {card.displayContent}
                          </span>
                        </>
                      ) : (
                        <>
                          {card.imageUrl ? (
                            <span
                              className="relative size-12 overflow-hidden rounded-full ring-1 ring-gold/50 sm:size-16"
                              aria-hidden="true"
                            >
                              <Image
                                src={card.imageUrl}
                                alt=""
                                fill
                                sizes="64px"
                                placeholder={card.blurHash ? "blur" : undefined}
                                blurDataURL={
                                  card.blurHash
                                    ? thumbHashToBlurDataURL(card.blurHash)
                                    : undefined
                                }
                                className="object-cover object-top"
                              />
                            </span>
                          ) : (
                            <span
                              className="flex size-11 items-center justify-center rounded-full border border-gold/40 bg-midnight font-serif text-lg text-gold-light sm:size-14 sm:text-xl"
                              aria-hidden="true"
                            >
                              {card.displayContent.charAt(0)}
                            </span>
                          )}
                          <span className="mt-2 line-clamp-2 px-1 text-center font-serif text-xs font-semibold text-foreground sm:text-sm">
                            {card.displayContent}
                          </span>
                        </>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="h-full flex items-center justify-center"
                    >
                      <span className="flex size-12 items-center justify-center rounded-full border border-gold/40 sm:size-16">
                        <MythosMark
                          id="labyrinth"
                          className="size-6 text-gold-light sm:size-8"
                        />
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {!gameStarted && (
        <div className="text-center">
          <p className="text-muted-foreground">
            Match each deity with their sacred symbol. Click a card to begin!
          </p>
        </div>
      )}
    </div>
  );
}
