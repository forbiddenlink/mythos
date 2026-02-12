'use client';

import { useState, useEffect, useRef } from 'react';
import { useNarration } from '@/lib/narration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Gauge,
  ScrollText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StoryNarratorProps {
  /** The text to narrate */
  text: string;
  /** Optional className for the container */
  className?: string;
  /** Whether to show in compact mode initially */
  defaultCompact?: boolean;
  /** Callback when auto-scroll should trigger */
  onAutoScroll?: (position: number, totalLength: number) => void;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2x' },
];

/**
 * StoryNarrator component provides text-to-speech narration controls
 * for story content using the Web Speech API.
 */
export function StoryNarrator({
  text,
  className,
  defaultCompact = false,
  onAutoScroll,
}: StoryNarratorProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCompact);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const lastScrollPositionRef = useRef(0);

  const {
    isPlaying,
    isPaused,
    currentPosition,
    totalLength,
    progress,
    speed,
    selectedVoice,
    availableVoices,
    isSupported,
    play,
    pause,
    resume,
    stop,
    setSpeed,
    setVoice,
    togglePlayPause,
  } = useNarration(text);

  // Handle auto-scroll callback
  useEffect(() => {
    if (autoScrollEnabled && onAutoScroll && currentPosition !== lastScrollPositionRef.current) {
      lastScrollPositionRef.current = currentPosition;
      onAutoScroll(currentPosition, totalLength);
    }
  }, [autoScrollEnabled, currentPosition, totalLength, onAutoScroll]);

  // Don't render if browser doesn't support speech synthesis
  if (!isSupported) {
    return (
      <Card className={cn('border-gold/20 bg-midnight-light/30', className)}>
        <CardContent className="py-4">
          <div className="flex items-center gap-3 text-parchment/60">
            <VolumeX className="h-5 w-5" />
            <span className="text-sm">
              Text-to-speech is not supported in your browser.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format time estimate based on average reading speed
  const estimatedDuration = Math.ceil((totalLength / 150) * (1 / speed)); // ~150 chars/second at 1x
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className={cn('border-gold/20 bg-midnight-light/30 overflow-hidden', className)}>
      <CardContent className="py-4 space-y-4">
        {/* Main Controls Row */}
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className={cn(
              'h-12 w-12 rounded-full border transition-all',
              isPlaying && !isPaused
                ? 'bg-gold/20 border-gold/50 text-gold hover:bg-gold/30'
                : 'bg-midnight/50 border-gold/30 text-gold/80 hover:bg-gold/20 hover:border-gold/50 hover:text-gold'
            )}
            aria-label={isPlaying && !isPaused ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          {/* Stop Button - only visible when playing or paused */}
          {(isPlaying || isPaused) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={stop}
              className="h-10 w-10 rounded-full border border-red-500/30 text-red-400/80 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400"
              aria-label="Stop narration"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}

          {/* Progress Bar */}
          <div className="flex-1 space-y-1">
            <div className="h-2 bg-midnight/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-parchment/50">
              <span>{Math.round(progress)}%</span>
              <span>~{formatTime(estimatedDuration)} total</span>
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 text-parchment/60 hover:text-parchment hover:bg-midnight/50"
            aria-label={isExpanded ? 'Collapse controls' : 'Expand controls'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-gold/10">
            {/* Speed Control */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-parchment/70 min-w-[80px]">
                <Gauge className="h-4 w-4" />
                <span className="text-sm">Speed</span>
              </div>
              <div className="flex-1">
                <Slider
                  value={[speed]}
                  onValueChange={(values) => setSpeed(values[0])}
                  min={0.5}
                  max={2}
                  step={0.25}
                  className="w-full"
                />
              </div>
              <div className="flex gap-1 min-w-[120px] justify-end">
                {SPEED_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSpeed(option.value)}
                    className={cn(
                      'px-2 py-1 text-xs rounded transition-colors',
                      speed === option.value
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-parchment/50 hover:text-parchment/80 hover:bg-midnight/50'
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Selection */}
            {availableVoices.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-parchment/70 min-w-[80px]">
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm">Voice</span>
                </div>
                <Select
                  value={selectedVoice?.name || ''}
                  onValueChange={(name) => setVoice(name)}
                >
                  <SelectTrigger className="flex-1 h-9 bg-midnight/50 border-gold/20 text-parchment hover:border-gold/40">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-midnight border-gold/30 max-h-60">
                    {availableVoices.map((voice) => (
                      <SelectItem
                        key={voice.voiceURI}
                        value={voice.name}
                        className="text-parchment hover:bg-gold/10"
                      >
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Auto-scroll Toggle */}
            {onAutoScroll && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-parchment/70 min-w-[80px]">
                  <ScrollText className="h-4 w-4" />
                  <span className="text-sm">Auto-scroll</span>
                </div>
                <button
                  onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg border transition-all',
                    autoScrollEnabled
                      ? 'bg-gold/20 border-gold/50 text-gold'
                      : 'bg-midnight/50 border-gold/20 text-parchment/60 hover:border-gold/40 hover:text-parchment/80'
                  )}
                >
                  {autoScrollEnabled ? 'Enabled' : 'Disabled'}
                </button>
                <span className="text-xs text-parchment/40">
                  Automatically scroll to follow the narration
                </span>
              </div>
            )}
          </div>
        )}

        {/* Compact Status Indicator */}
        {!isExpanded && (isPlaying || isPaused) && (
          <div className="flex items-center gap-2 text-xs text-parchment/60">
            <Volume2 className="h-3 w-3" />
            <span>
              {isPaused ? 'Paused' : 'Playing'} at {speed}x
              {selectedVoice && ` - ${selectedVoice.name.split(' ').slice(0, 2).join(' ')}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
