'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  EyeOff,
  Lightbulb,
  Image as ImageIcon,
  Users,
  Globe,
  Sparkles,
  Hash,
} from 'lucide-react';
import Image from 'next/image';
import type { ReviewCard, DifficultyRating, FlashcardType } from '@/lib/spaced-repetition';
import { RATING_LABELS } from '@/lib/spaced-repetition';

interface FlashCardProps {
  card: ReviewCard;
  onRate: (rating: DifficultyRating) => void;
  showAnswer?: boolean;
}

const TYPE_CONFIG: Record<FlashcardType, { icon: typeof Eye; label: string; color: string }> = {
  'deity-recognition': {
    icon: ImageIcon,
    label: 'Visual ID',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  'domain-match': {
    icon: Sparkles,
    label: 'Domain',
    color: 'bg-gold/20 text-gold border-gold/30',
  },
  'symbol-match': {
    icon: Hash,
    label: 'Symbol',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  'pantheon-match': {
    icon: Globe,
    label: 'Pantheon',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  'story-character': {
    icon: Users,
    label: 'Story',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
};

export function FlashCard({ card, onRate, showAnswer: initialShowAnswer = false }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(initialShowAnswer);
  const [showHint, setShowHint] = useState(false);

  const typeConfig = TYPE_CONFIG[card.type];
  const TypeIcon = typeConfig.icon;

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleRate = (rating: DifficultyRating) => {
    onRate(rating);
    // Reset state for next card
    setIsFlipped(false);
    setShowHint(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={isFlipped ? 'back' : 'front'}
          initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          <Card className="border-2 border-border/60 shadow-xl overflow-hidden min-h-[320px] flex flex-col">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
              <Badge
                variant="outline"
                className={`${typeConfig.color} border`}
              >
                <TypeIcon className="h-3 w-3 mr-1.5" />
                {typeConfig.label}
              </Badge>
              {!isFlipped && card.hint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-muted-foreground hover:text-gold"
                >
                  <Lightbulb className="h-4 w-4 mr-1.5" />
                  {showHint ? 'Hide Hint' : 'Show Hint'}
                </Button>
              )}
            </div>

            <CardContent className="flex-1 flex flex-col justify-center p-6">
              {!isFlipped ? (
                // Front of card (Question)
                <div className="space-y-6 text-center">
                  {card.imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/40 shadow-inner bg-black/5 mx-auto max-w-sm">
                      <Image
                        src={card.imageUrl}
                        alt="Identify this"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-serif font-semibold text-foreground leading-tight">
                      {card.question}
                    </h3>

                    {showHint && card.hint && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 inline-block"
                      >
                        {card.hint}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    onClick={handleFlip}
                    size="lg"
                    className="mt-4 gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Eye className="h-4 w-4" />
                    Reveal Answer
                  </Button>
                </div>
              ) : (
                // Back of card (Answer + Rating)
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      Answer
                    </p>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-gold">
                      {card.answer}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      How well did you remember?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {([1, 2, 3, 4] as DifficultyRating[]).map((rating) => {
                        const config = RATING_LABELS[rating];
                        return (
                          <Button
                            key={rating}
                            onClick={() => handleRate(rating)}
                            className={`${config.color} text-white h-auto py-3 flex flex-col gap-1`}
                          >
                            <span className="font-semibold">{config.label}</span>
                            <span className="text-xs opacity-80">
                              {config.description}
                            </span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
