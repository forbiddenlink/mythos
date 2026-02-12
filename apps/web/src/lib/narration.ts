'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Represents the current state of the narration.
 */
export interface NarrationState {
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is paused */
  isPaused: boolean;
  /** Current position in the text (character index) */
  currentPosition: number;
  /** Total length of the text being narrated */
  totalLength: number;
  /** Progress as a percentage (0-100) */
  progress: number;
  /** Current playback speed */
  speed: number;
  /** Currently selected voice */
  selectedVoice: SpeechSynthesisVoice | null;
  /** Available voices */
  availableVoices: SpeechSynthesisVoice[];
  /** Whether browser supports speech synthesis */
  isSupported: boolean;
}

export interface UseNarrationOptions {
  /** Initial playback speed (default: 1) */
  initialSpeed?: number;
  /** Preferred voice name pattern */
  preferredVoice?: string;
}

export interface UseNarrationReturn extends NarrationState {
  /** Start playing from the beginning or resume if paused */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Resume playback after pause */
  resume: () => void;
  /** Stop playback and reset position */
  stop: () => void;
  /** Set playback speed (0.5 - 2) */
  setSpeed: (speed: number) => void;
  /** Select a voice by name or voice object */
  setVoice: (voice: SpeechSynthesisVoice | string) => void;
  /** Toggle play/pause */
  togglePlayPause: () => void;
}

/**
 * Hook for text-to-speech narration with progress tracking and voice selection.
 * Uses the Web Speech API (SpeechSynthesis).
 */
export function useNarration(
  text: string,
  options: UseNarrationOptions = {}
): UseNarrationReturn {
  const { initialSpeed = 1, preferredVoice } = options;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [speed, setSpeedState] = useState(initialSpeed);
  const [selectedVoice, setSelectedVoiceState] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  // Refs
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef(text);

  // Keep text ref updated
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
      setIsSupported(true);

      // Load voices (may be async on some browsers)
      const loadVoices = () => {
        const voices = synthesisRef.current?.getVoices() || [];
        setAvailableVoices(voices);

        // Set default voice
        if (voices.length > 0 && !selectedVoice) {
          // Try to find preferred voice
          let voice: SpeechSynthesisVoice | undefined;

          if (preferredVoice) {
            voice = voices.find((v) =>
              v.name.toLowerCase().includes(preferredVoice.toLowerCase())
            );
          }

          // Fall back to a good English voice
          if (!voice) {
            voice =
              voices.find(
                (v) =>
                  v.name.includes('Google UK English Male') ||
                  v.name.includes('Daniel') ||
                  v.lang === 'en-GB'
              ) ||
              voices.find((v) => v.lang.startsWith('en')) ||
              voices[0];
          }

          if (voice) {
            setSelectedVoiceState(voice);
          }
        }
      };

      loadVoices();

      // Chrome loads voices asynchronously
      if (synthesisRef.current) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, [preferredVoice, selectedVoice]);

  // Calculate total length and progress
  const totalLength = text.length;
  const progress = totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;

  // Stop and reset
  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPosition(0);
  }, []);

  // Create and configure utterance
  const createUtterance = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(textRef.current);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = speed;
    utterance.pitch = 0.95;

    // Track progress via boundary events
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        setCurrentPosition(event.charIndex);
      }
    };

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentPosition(totalLength);
    };

    utterance.onerror = (event) => {
      // Ignore 'interrupted' errors which happen on normal stop/cancel
      if (event.error !== 'interrupted') {
        console.error('Speech synthesis error:', event.error);
      }
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    return utterance;
  }, [selectedVoice, speed, totalLength]);

  // Play from beginning or resume
  const play = useCallback(() => {
    if (!synthesisRef.current || !isSupported) return;

    if (isPaused) {
      synthesisRef.current.resume();
      return;
    }

    // Cancel any existing speech
    synthesisRef.current.cancel();

    // Create new utterance and play
    const utterance = createUtterance();
    utteranceRef.current = utterance;
    setCurrentPosition(0);

    synthesisRef.current.speak(utterance);
  }, [createUtterance, isPaused, isSupported]);

  // Pause
  const pause = useCallback(() => {
    if (synthesisRef.current && isPlaying && !isPaused) {
      synthesisRef.current.pause();
    }
  }, [isPlaying, isPaused]);

  // Resume
  const resume = useCallback(() => {
    if (synthesisRef.current && isPaused) {
      synthesisRef.current.resume();
    }
  }, [isPaused]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      play();
    }
  }, [isPlaying, isPaused, play, pause, resume]);

  // Set speed
  const setSpeed = useCallback(
    (newSpeed: number) => {
      const clampedSpeed = Math.max(0.5, Math.min(2, newSpeed));
      setSpeedState(clampedSpeed);

      // If currently playing, restart with new speed
      if (isPlaying && synthesisRef.current) {
        const wasPlaying = isPlaying && !isPaused;
        synthesisRef.current.cancel();

        if (wasPlaying) {
          // Small delay to ensure cancel completes
          setTimeout(() => {
            if (synthesisRef.current) {
              const utterance = createUtterance();
              utteranceRef.current = utterance;
              synthesisRef.current.speak(utterance);
            }
          }, 50);
        }
      }
    },
    [createUtterance, isPlaying, isPaused]
  );

  // Set voice
  const setVoice = useCallback(
    (voice: SpeechSynthesisVoice | string) => {
      let newVoice: SpeechSynthesisVoice | null = null;

      if (typeof voice === 'string') {
        newVoice =
          availableVoices.find((v) => v.name === voice || v.voiceURI === voice) || null;
      } else {
        newVoice = voice;
      }

      if (newVoice) {
        setSelectedVoiceState(newVoice);

        // If currently playing, restart with new voice
        if (isPlaying && synthesisRef.current) {
          const wasPlaying = isPlaying && !isPaused;
          synthesisRef.current.cancel();

          if (wasPlaying) {
            setTimeout(() => {
              if (synthesisRef.current) {
                const utterance = new SpeechSynthesisUtterance(textRef.current);
                utterance.voice = newVoice;
                utterance.rate = speed;
                utterance.pitch = 0.95;

                utterance.onboundary = (event) => {
                  if (event.name === 'word' || event.name === 'sentence') {
                    setCurrentPosition(event.charIndex);
                  }
                };

                utterance.onstart = () => {
                  setIsPlaying(true);
                  setIsPaused(false);
                };

                utterance.onend = () => {
                  setIsPlaying(false);
                  setIsPaused(false);
                  setCurrentPosition(totalLength);
                };

                utterance.onerror = (event) => {
                  if (event.error !== 'interrupted') {
                    console.error('Speech synthesis error:', event.error);
                  }
                  setIsPlaying(false);
                  setIsPaused(false);
                };

                utteranceRef.current = utterance;
                synthesisRef.current?.speak(utterance);
              }
            }, 50);
          }
        }
      }
    },
    [availableVoices, isPlaying, isPaused, speed, totalLength]
  );

  // Memoize return value
  return useMemo(
    () => ({
      // State
      isPlaying,
      isPaused,
      currentPosition,
      totalLength,
      progress,
      speed,
      selectedVoice,
      availableVoices,
      isSupported,
      // Actions
      play,
      pause,
      resume,
      stop,
      setSpeed,
      setVoice,
      togglePlayPause,
    }),
    [
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
    ]
  );
}
