'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { GET_DEITIES } from '@/lib/queries';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  RefreshCw,
  Timer,
  Sparkles,
  Grid3X3,
  Crown,
  Zap,
} from 'lucide-react';

interface Deity {
  id: string;
  name: string;
  symbols: string[];
  pantheonId: string;
}

interface MemoryCard {
  id: string;
  type: 'symbol' | 'deity';
  content: string;
  displayContent: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; label: string; gridCols: string }> = {
  easy: { pairs: 6, label: 'Easy', gridCols: 'grid-cols-3 sm:grid-cols-4' },
  medium: { pairs: 8, label: 'Medium', gridCols: 'grid-cols-4' },
  hard: { pairs: 12, label: 'Hard', gridCols: 'grid-cols-4 sm:grid-cols-6' },
};

// Symbol to emoji/display mapping
const SYMBOL_DISPLAY: Record<string, string> = {
  thunderbolt: '\u26A1',
  eagle: '\uD83E\uDD85',
  'oak tree': '\uD83C\uDF33',
  bull: '\uD83D\uDC02',
  peacock: '\uD83E\uDD9A',
  cow: '\uD83D\uDC04',
  pomegranate: '\uD83C\uDF52',
  diadem: '\uD83D\uDC51',
  trident: '\uD83D\uDD31',
  horse: '\uD83D\uDC0E',
  dolphin: '\uD83D\uDC2C',
  owl: '\uD83E\uDD89',
  'olive tree': '\uD83C\uDF3F',
  spear: '\uD83D\uDDE1\uFE0F',
  aegis: '\uD83D\uDEE1\uFE0F',
  lyre: '\uD83C\uDFB5',
  sun: '\u2600\uFE0F',
  laurel: '\uD83C\uDF3F',
  'bow and arrow': '\uD83C\uDFF9',
  moon: '\uD83C\uDF19',
  deer: '\uD83E\uDD8C',
  cypress: '\uD83C\uDF32',
  torch: '\uD83D\uDD25',
  caduceus: '\u2695\uFE0F',
  'winged sandals': '\uD83D\uDC5F',
  hammer: '\uD83D\uDD28',
  anvil: '\u2692\uFE0F',
  fire: '\uD83D\uDD25',
  tongs: '\uD83D\uDD27',
  wheat: '\uD83C\uDF3E',
  scepter: '\uD83D\uDC51',
  dove: '\uD83D\uDD4A\uFE0F',
  rose: '\uD83C\uDF39',
  myrtle: '\uD83C\uDF3F',
  mirror: '\uD83E\uDE9E',
  sword: '\u2694\uFE0F',
  helmet: '\uD83E\uDE96',
  shield: '\uD83D\uDEE1\uFE0F',
  spiders: '\uD83D\uDD77\uFE0F',
  loom: '\uD83E\uDEA1',
  grape: '\uD83C\uDF47',
  ivy: '\uD83C\uDF3F',
  thyrsus: '\uD83C\uDF3F',
  'theater mask': '\uD83C\uDFAD',
  'three-headed dog': '\uD83D\uDC15',
  'cypress tree': '\uD83C\uDF32',
  key: '\uD83D\uDD11',
  narcissus: '\uD83C\uDF3C',
  skull: '\uD83D\uDC80',
  hearth: '\uD83D\uDD25',
  'eternal flame': '\uD83D\uDD25',
  serpent: '\uD83D\uDC0D',
  snake: '\uD83D\uDC0D',
  eye: '\uD83D\uDC41\uFE0F',
  scarab: '\uD83E\uDEB2',
  ankh: '\u2625\uFE0F',
  cat: '\uD83D\uDC08',
  sistrum: '\uD83C\uDFB5',
  ibis: '\uD83E\uDDA9',
  scales: '\u2696\uFE0F',
  feather: '\uD83E\uDEB6',
  'mummified form': '\uD83E\uDDDF',
  crook: '\uD83E\uDE9D',
  flail: '\uD83E\uDE9D',
  crocodile: '\uD83D\uDC0A',
  wolf: '\uD83D\uDC3A',
  raven: '\uD83D\uDC26\u200D\u2B1B',
  ring: '\uD83D\uDC8D',
  ravens: '\uD83D\uDC26\u200D\u2B1B',
  wolves: '\uD83D\uDC3A',
  goats: '\uD83D\uDC10',
  boar: '\uD83D\uDC17',
  falcon: '\uD83E\uDD85',
  necklace: '\uD83D\uDCFF',
  apple: '\uD83C\uDF4E',
  chariot: '\uD83D\uDE9C',
  gold: '\u2728',
  horn: '\uD83C\uDF7A',
  'drinking horn': '\uD83C\uDF7A',
  bow: '\uD83C\uDFF9',
  skis: '\uD83C\uDFBF',
  ship: '\u26F5',
  mistletoe: '\uD83C\uDF3F',
  runes: '\u16A0',
  staff: '\uD83E\uDE84',
  web: '\uD83D\uDD78\uFE0F',
  frost: '\u2744\uFE0F',
  ice: '\u2744\uFE0F',
  lotus: '\uD83C\uDF38',
  conch: '\uD83D\uDC1A',
  discus: '\uD83E\uDD4F',
  mace: '\uD83D\uDDE1\uFE0F',
  flute: '\uD83C\uDFB6',
  drum: '\uD83E\uDD41',
  elephant: '\uD83D\uDC18',
  lion: '\uD83E\uDD81',
  tiger: '\uD83D\uDC05',
};

function getSymbolDisplay(symbol: string): string {
  const normalizedSymbol = symbol.toLowerCase();
  return SYMBOL_DISPLAY[normalizedSymbol] || symbol.charAt(0).toUpperCase() + symbol.slice(1);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SymbolMemoryGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  // Load best times from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mythos_memory_best_times');
    if (saved) {
      try {
        setBestTimes(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameCompleted || !startTime) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  const { data, isLoading } = useQuery<{ deities: Deity[] }>({
    queryKey: ['memory-game-deities'],
    queryFn: async () => {
      const response = await graphqlClient.request<{ deities: Deity[] }>(GET_DEITIES);
      return response;
    },
  });

  const initializeGame = useCallback(() => {
    if (!data?.deities) return;

    const config = DIFFICULTY_CONFIG[difficulty];

    // Filter deities that have symbols
    const deitiesWithSymbols = data.deities.filter(
      (deity) => deity.symbols && deity.symbols.length > 0
    );

    // Shuffle and pick deities for the game
    const selectedDeities = shuffleArray(deitiesWithSymbols).slice(0, config.pairs);

    // Create card pairs
    const cardPairs: MemoryCard[] = [];
    selectedDeities.forEach((deity) => {
      const pairId = deity.id;
      const primarySymbol = deity.symbols[0];

      // Symbol card
      cardPairs.push({
        id: `${deity.id}-symbol`,
        type: 'symbol',
        content: primarySymbol,
        displayContent: getSymbolDisplay(primarySymbol),
        pairId,
        isFlipped: false,
        isMatched: false,
      });

      // Deity name card
      cardPairs.push({
        id: `${deity.id}-deity`,
        type: 'deity',
        content: deity.name,
        displayContent: deity.name,
        pairId,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle all cards
    setCards(shuffleArray(cardPairs));
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(false);
    setGameCompleted(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsChecking(false);
  }, [data?.deities, difficulty]);

  // Initialize game when data loads or difficulty changes
  useEffect(() => {
    if (data?.deities) {
      initializeGame();
    }
  }, [data?.deities, difficulty, initializeGame]);

  const handleCardClick = (cardId: string) => {
    if (isChecking) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    // Start game timer on first click
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    // Flip the card
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
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
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          )
        );
        setMatches((prev) => prev + 1);
        setFlippedCards([]);
        setIsChecking(false);

        // Check for game completion
        const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
        if (matches + 1 === totalPairs) {
          setGameCompleted(true);
          const finalTime = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
          setElapsedTime(finalTime);

          // Update best time
          if (!bestTimes[difficulty] || finalTime < bestTimes[difficulty]!) {
            const newBestTimes = { ...bestTimes, [difficulty]: finalTime };
            setBestTimes(newBestTimes);
            localStorage.setItem('mythos_memory_best_times', JSON.stringify(newBestTimes));
          }
        }
      } else {
        // No match - flip cards back after delay
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !data?.deities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
          <p className="text-muted-foreground">Preparing the sacred symbols...</p>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;
    const perfectMoves = totalPairs;
    const efficiency = Math.round((perfectMoves / moves) * 100);
    const isBestTime = bestTimes[difficulty] === elapsedTime;

    return (
      <Card className="max-w-2xl mx-auto border-gold/20 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-6 p-6 rounded-full bg-gradient-to-br from-gold/20 to-amber-500/10 w-fit ring-1 ring-gold/30 shadow-inner">
            <Trophy className="h-16 w-16 text-gold drop-shadow-md" />
          </div>
          <CardTitle className="text-3xl font-serif">Memory Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pb-8">
          <div className="text-center">
            <div className="text-6xl font-bold text-gold mb-2 tracking-tight">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-lg text-muted-foreground font-medium">
              {isBestTime && 'New Best Time!'}
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
              <div className="text-center p-3 rounded-lg bg-muted/50 w-28 border border-gold/20 bg-gold/5">
                <div className="text-gold/80 mb-1 flex items-center justify-center gap-1">
                  <Crown className="h-3 w-3" /> Best
                </div>
                <div className="font-bold text-lg text-gold">{formatTime(bestTimes[difficulty]!)}</div>
              </div>
            )}
          </div>

          <div className="text-center max-w-sm mx-auto">
            {efficiency >= 80 ? (
              <p className="text-lg">Remarkable memory! The gods themselves would be impressed.</p>
            ) : efficiency >= 60 ? (
              <p className="text-lg">Well done! You honor the ancient symbols with your recall.</p>
            ) : (
              <p className="text-lg">The symbols reveal themselves to those who practice. Try again!</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={initializeGame} className="flex-1 h-12 text-lg gap-2 bg-gold hover:bg-gold/90 text-black">
              <RefreshCw className="h-5 w-5" />
              Play Again
            </Button>
            <Button
              onClick={() => {
                const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
                const currentIndex = difficulties.indexOf(difficulty);
                const nextDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <Timer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-mono text-lg font-semibold" aria-label={`Time: ${formatTime(elapsedTime)}`}>
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
            <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span className="font-semibold" aria-label={`Moves: ${moves}`}>
              {moves} moves
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold/10 border border-gold/20 text-gold"
            role="status"
            aria-label={`Matches: ${matches} of ${config.pairs}`}
          >
            <Trophy className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold">
              {matches}/{config.pairs}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
            <Button
              key={diff}
              variant={difficulty === diff ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(diff)}
              className={difficulty === diff ? 'bg-gold hover:bg-gold/90 text-black' : ''}
            >
              {DIFFICULTY_CONFIG[diff].label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={initializeGame}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Game Grid */}
      <div
        className={`grid ${config.gridCols} gap-3 max-w-4xl mx-auto`}
        role="grid"
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
                  ${card.isMatched
                    ? 'border-green-500/50 bg-green-500/10 cursor-default'
                    : card.isFlipped
                      ? 'border-gold/50 bg-gold/10 cursor-default'
                      : 'border-border hover:border-gold/30 hover:bg-gold/5 cursor-pointer active:scale-95'
                  }
                `}
                aria-label={
                  card.isMatched
                    ? `Matched: ${card.type === 'symbol' ? `Symbol for ${card.content}` : card.content}`
                    : card.isFlipped
                      ? `${card.type === 'symbol' ? `Symbol: ${card.content}` : card.content}`
                      : 'Face down card'
                }
                aria-pressed={card.isFlipped}
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
                      {card.type === 'symbol' ? (
                        <>
                          <span className="text-4xl sm:text-5xl" role="img" aria-label={card.content}>
                            {card.displayContent}
                          </span>
                          <span className="text-xs text-muted-foreground mt-1 capitalize hidden sm:block">
                            {card.content}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm sm:text-base font-serif font-semibold text-center px-1">
                          {card.displayContent}
                        </span>
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
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-gold/20 to-amber-600/20 flex items-center justify-center border border-gold/30">
                        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-gold/60" />
                      </div>
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
