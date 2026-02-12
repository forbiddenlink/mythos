'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  RotateCcw,
  Trophy,
  Skull,
  Scale,
  ChevronRight,
  History,
  Sparkles,
} from 'lucide-react';
import {
  BranchingStory,
  StoryNode,
  StoryProgress,
  saveStoryProgress,
  getStoryProgress,
  clearStoryProgress,
  saveDiscoveredEnding,
  getDiscoveredEndings,
  getEndingTypeColor,
  getEndingTypeLabel,
} from '@/lib/branching-story';
import { cn } from '@/lib/utils';

interface InteractiveStoryProps {
  story: BranchingStory;
}

export function InteractiveStory({ story }: InteractiveStoryProps) {
  const [currentNodeId, setCurrentNodeId] = useState<string>(story.startNodeId);
  const [pathTaken, setPathTaken] = useState<string[]>([story.startNodeId]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [discoveredEndings, setDiscoveredEndings] = useState<string[]>([]);
  const [showEndingScreen, setShowEndingScreen] = useState(false);
  const [showPathHistory, setShowPathHistory] = useState(false);

  const currentNode = story.nodes[currentNodeId];

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = getStoryProgress(story.id);
    if (savedProgress) {
      setCurrentNodeId(savedProgress.currentNodeId);
      setPathTaken(savedProgress.pathTaken);
    }

    const savedEndings = getDiscoveredEndings(story.id);
    setDiscoveredEndings(savedEndings);
  }, [story.id]);

  // Save progress when node changes
  useEffect(() => {
    const progress: StoryProgress = {
      storyId: story.id,
      currentNodeId,
      pathTaken,
      endingsDiscovered: discoveredEndings,
      lastPlayed: new Date().toISOString(),
    };
    saveStoryProgress(progress);
  }, [story.id, currentNodeId, pathTaken, discoveredEndings]);

  // Handle ending discovery
  useEffect(() => {
    if (currentNode?.ending && !discoveredEndings.includes(currentNodeId)) {
      saveDiscoveredEnding(story.id, currentNodeId);
      setDiscoveredEndings((prev) => [...prev, currentNodeId]);
      setShowEndingScreen(true);
    }
  }, [currentNode, currentNodeId, story.id, discoveredEndings]);

  const handleChoice = useCallback(
    (nextNodeId: string) => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentNodeId(nextNodeId);
        setPathTaken((prev) => [...prev, nextNodeId]);
        setIsTransitioning(false);
      }, 300);
    },
    []
  );

  const handleRestart = useCallback(() => {
    setIsTransitioning(true);
    setShowEndingScreen(false);
    setTimeout(() => {
      setCurrentNodeId(story.startNodeId);
      setPathTaken([story.startNodeId]);
      clearStoryProgress(story.id);
      setIsTransitioning(false);
    }, 300);
  }, [story.id, story.startNodeId]);

  const getEndingIcon = (type: 'good' | 'neutral' | 'tragic') => {
    switch (type) {
      case 'good':
        return <Trophy className="h-8 w-8" />;
      case 'neutral':
        return <Scale className="h-8 w-8" />;
      case 'tragic':
        return <Skull className="h-8 w-8" />;
    }
  };

  const endingNodes = Object.entries(story.nodes).filter(
    ([, node]) => node.ending
  );

  if (!currentNode) {
    return (
      <Card className="border-red-500/30 bg-red-500/10">
        <CardContent className="py-8 text-center">
          <p className="text-red-400">Story node not found: {currentNodeId}</p>
          <Button onClick={handleRestart} className="mt-4">
            Restart Story
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-sm text-parchment/70">
                Endings Discovered
              </span>
            </div>
            <span className="text-gold font-semibold">
              {discoveredEndings.length} / {story.totalEndings}
            </span>
          </div>
          <div className="h-2 bg-midnight rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-dark to-gold"
              initial={{ width: 0 }}
              animate={{
                width: `${(discoveredEndings.length / story.totalEndings) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Ending badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {endingNodes.map(([nodeId, node]) => {
              const isDiscovered = discoveredEndings.includes(nodeId);
              const ending = node.ending!;
              return (
                <Badge
                  key={nodeId}
                  variant="outline"
                  className={cn(
                    'transition-all',
                    isDiscovered
                      ? getEndingTypeColor(ending.type)
                      : 'text-parchment/30 border-parchment/20 bg-transparent'
                  )}
                >
                  {isDiscovered ? (
                    <>
                      {ending.type === 'good' && <Trophy className="h-3 w-3 mr-1" />}
                      {ending.type === 'neutral' && <Scale className="h-3 w-3 mr-1" />}
                      {ending.type === 'tragic' && <Skull className="h-3 w-3 mr-1" />}
                      {ending.summary.split(' ').slice(0, 3).join(' ')}...
                    </>
                  ) : (
                    '???'
                  )}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Story Content */}
      <AnimatePresence mode="wait">
        {showEndingScreen && currentNode.ending ? (
          <motion.div
            key="ending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Card
              className={cn(
                'border-2 overflow-hidden',
                getEndingTypeColor(currentNode.ending.type)
              )}
            >
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-4">
                  <div
                    className={cn(
                      'p-4 rounded-full',
                      getEndingTypeColor(currentNode.ending.type)
                    )}
                  >
                    {getEndingIcon(currentNode.ending.type)}
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif text-parchment">
                  {getEndingTypeLabel(currentNode.ending.type)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Final narrative */}
                <div className="prose prose-invert prose-gold max-w-none prose-p:text-parchment/80 prose-headings:text-gold/90">
                  <ReactMarkdown>{currentNode.content}</ReactMarkdown>
                </div>

                {/* Ending summary */}
                <div
                  className={cn(
                    'p-4 rounded-lg border',
                    getEndingTypeColor(currentNode.ending.type)
                  )}
                >
                  <p className="text-center text-lg italic">
                    {currentNode.ending.summary}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-midnight/50 rounded-lg">
                    <p className="text-2xl font-bold text-gold">
                      {pathTaken.length}
                    </p>
                    <p className="text-sm text-parchment/60">Choices Made</p>
                  </div>
                  <div className="p-4 bg-midnight/50 rounded-lg">
                    <p className="text-2xl font-bold text-gold">
                      {discoveredEndings.length} / {story.totalEndings}
                    </p>
                    <p className="text-sm text-parchment/60">Endings Found</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleRestart}
                    variant="gold"
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Play Again
                  </Button>
                  <Button
                    onClick={() => setShowPathHistory(!showPathHistory)}
                    variant="outline"
                    className="gap-2 border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <History className="h-4 w-4" />
                    View Path
                  </Button>
                </div>

                {/* Path history */}
                <AnimatePresence>
                  {showPathHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-midnight/50 rounded-lg border border-gold/20">
                        <h4 className="text-sm font-semibold text-gold mb-3">
                          Your Journey
                        </h4>
                        <div className="space-y-2">
                          {pathTaken.map((nodeId, index) => {
                            const node = story.nodes[nodeId];
                            const title =
                              node?.content.split('\n')[0].replace(/^#+\s*/, '') ||
                              nodeId;
                            return (
                              <div
                                key={`${nodeId}-${index}`}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="text-gold/60">
                                  {index + 1}.
                                </span>
                                <span className="text-parchment/70 truncate">
                                  {title.slice(0, 50)}
                                  {title.length > 50 ? '...' : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={currentNodeId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isTransitioning ? 0 : 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <Card className="border-gold/20 bg-midnight-light/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                  <BookOpen className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <CardTitle className="text-xl font-serif text-parchment">
                    {story.title}
                  </CardTitle>
                  <p className="text-sm text-parchment/60">
                    Playing as {story.protagonist}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Story content */}
                <div className="prose prose-invert prose-gold max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-gold/90 prose-strong:text-gold/80 prose-blockquote:border-l-gold/40 prose-blockquote:text-parchment/70">
                  <ReactMarkdown>{currentNode.content}</ReactMarkdown>
                </div>

                {/* Choices */}
                {currentNode.choices && currentNode.choices.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-gold/70 font-medium uppercase tracking-wide">
                      What do you do?
                    </p>
                    <div className="space-y-2">
                      {currentNode.choices.map((choice, index) => (
                        <motion.button
                          key={choice.nextNodeId}
                          onClick={() => handleChoice(choice.nextNodeId)}
                          disabled={isTransitioning}
                          className={cn(
                            'w-full text-left p-4 rounded-lg border transition-all',
                            'bg-midnight/50 border-gold/20 hover:border-gold/50 hover:bg-gold/5',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'group'
                          )}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center gap-3">
                            <ChevronRight className="h-5 w-5 text-gold/50 group-hover:text-gold transition-colors" />
                            <div className="flex-1">
                              <p className="text-parchment group-hover:text-gold transition-colors">
                                {choice.text}
                              </p>
                              {choice.consequence && (
                                <p className="text-xs text-parchment/50 mt-1 italic">
                                  {choice.consequence}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Restart button (always visible during story) */}
                <div className="pt-4 border-t border-gold/10">
                  <Button
                    onClick={handleRestart}
                    variant="ghost"
                    size="sm"
                    className="text-parchment/50 hover:text-parchment"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
