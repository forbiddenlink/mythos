'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Pantheon ambient tracks
const PANTHEON_TRACKS: Record<string, string> = {
    'greek-pantheon': '/audio/ambient/greek-ambiance.mp3',
    'roman-pantheon': '/audio/ambient/roman-ambiance.mp3',
    'norse-pantheon': '/audio/ambient/norse-ambiance.mp3',
    'egyptian-pantheon': '/audio/ambient/egyptian-ambiance.mp3',
    'hindu-pantheon': '/audio/ambient/hindu-ambiance.mp3',
    'japanese-pantheon': '/audio/ambient/japanese-ambiance.mp3',
    'celtic-pantheon': '/audio/ambient/celtic-ambiance.mp3',
    'aztec-pantheon': '/audio/ambient/aztec-ambiance.mp3',
    'chinese-pantheon': '/audio/ambient/chinese-ambiance.mp3',
    'default': '/audio/ambient/default.mp3',
};

// Deity domain to sound effect mapping
const DOMAIN_EFFECTS: Record<string, string> = {
    'sky': '/audio/effects/thunder.mp3',
    'thunder': '/audio/effects/thunder.mp3',
    'lightning': '/audio/effects/lightning.mp3',
    'storm': '/audio/effects/thunder.mp3',
    'sea': '/audio/effects/ocean-wave.mp3',
    'ocean': '/audio/effects/ocean-wave.mp3',
    'water': '/audio/effects/ocean-wave.mp3',
    'fire': '/audio/effects/fire-crackle.mp3',
    'forge': '/audio/effects/fire-crackle.mp3',
    'metalworking': '/audio/effects/fire-crackle.mp3',
    'wisdom': '/audio/effects/owl-hoot.mp3',
    'knowledge': '/audio/effects/owl-hoot.mp3',
    'war': '/audio/effects/war-drums.mp3',
    'battle': '/audio/effects/war-drums.mp3',
    'music': '/audio/effects/harp-gliss.mp3',
    'poetry': '/audio/effects/harp-gliss.mp3',
    'death': '/audio/effects/divine-presence.mp3',
    'underworld': '/audio/effects/divine-presence.mp3',
    'sun': '/audio/effects/divine-presence.mp3',
    'moon': '/audio/effects/temple-bell.mp3',
    'wind': '/audio/effects/wind-howl.mp3',
};

// UI sound effects
const UI_SOUNDS: Record<string, string> = {
    'click': '/audio/ui/click.mp3',
    'hover': '/audio/ui/hover.mp3',
    'achievement': '/audio/ui/achievement.mp3',
    'success': '/audio/ui/success.mp3',
    'error': '/audio/ui/error.mp3',
    'page-turn': '/audio/ui/page-turn.mp3',
};

interface AudioContextType {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTrack: string | undefined;
    isLoading: boolean;
    togglePlay: () => void;
    toggleMute: () => void;
    setVolume: (val: number) => void;
    playPantheonTrack: (pantheonId: string) => void;
    playDomainEffect: (domain: string) => void;
    playUISound: (sound: 'click' | 'hover' | 'achievement' | 'success' | 'error' | 'page-turn') => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Lazy-loaded Howl type
type HowlType = import('howler').Howl;

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted by default for UX
    const [volume, setVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState<string>('default');
    const [isLoading, setIsLoading] = useState(false);
    const [howlerLoaded, setHowlerLoaded] = useState(false);

    const howlRef = useRef<HowlType | null>(null);
    const HowlClass = useRef<typeof import('howler').Howl | null>(null);
    const pathname = usePathname();

    // Lazy load Howler.js only when needed
    const loadHowler = useCallback(async () => {
        if (HowlClass.current) return HowlClass.current;

        setIsLoading(true);
        try {
            const howlerModule = await import('howler');
            HowlClass.current = howlerModule.Howl;
            setHowlerLoaded(true);
            return howlerModule.Howl;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const playTrack = useCallback(async (trackKey: string) => {
        // Ensure Howler is loaded
        const Howl = await loadHowler();
        if (!Howl) return;

        // Determine file path
        const src = PANTHEON_TRACKS[trackKey] || PANTHEON_TRACKS['default'];

        // Don't restart if already playing the same track
        if (howlRef.current && currentTrack === trackKey && howlRef.current.playing()) {
            return;
        }

        // Fade out old track
        if (howlRef.current) {
            const oldHowl = howlRef.current;
            oldHowl.fade(volume, 0, 1000);
            setTimeout(() => {
                oldHowl.unload();
            }, 1000);
        }

        // Create new track
        const newHowl = new Howl({
            src: [src],
            html5: true,
            loop: true,
            volume: 0, // Start at 0 for fade in
            onloaderror: (id: number, err: unknown) => console.warn(`Audio load error for ${src}:`, err)
        });

        howlRef.current = newHowl;
        setCurrentTrack(trackKey);

        if (!isMuted) {
            newHowl.play();
            newHowl.fade(0, volume, 1000);
            setIsPlaying(true);
        }
    }, [currentTrack, isMuted, volume, loadHowler]);

    // Effect to handle navigation changes - only switch tracks if audio is active
    useEffect(() => {
        // Only process track changes if Howler is loaded and audio is unmuted
        if (!howlerLoaded || isMuted) {
            // Track the current pantheon for when user unmutes
            let foundPantheon = 'default';
            for (const key of Object.keys(PANTHEON_TRACKS)) {
                if (pathname?.includes(key)) {
                    foundPantheon = key;
                    break;
                }
            }
            if (foundPantheon !== currentTrack) {
                setCurrentTrack(foundPantheon);
            }
            return;
        }

        let foundPantheon = 'default';
        for (const key of Object.keys(PANTHEON_TRACKS)) {
            if (pathname?.includes(key)) {
                foundPantheon = key;
                break;
            }
        }

        if (foundPantheon !== currentTrack) {
            playTrack(foundPantheon);
        }
    }, [pathname, playTrack, currentTrack, isMuted, howlerLoaded]);

    // Handle controls
    const togglePlay = useCallback(async () => {
        if (isPlaying) {
            howlRef.current?.pause();
            setIsPlaying(false);
        } else {
            // Load Howler if not already loaded
            await loadHowler();

            // If we have a track loaded, play it. If not, load current.
            if (!howlRef.current || howlRef.current.state() === 'unloaded') {
                await playTrack(currentTrack || 'default');
            } else {
                howlRef.current.play();
                howlRef.current.fade(0, volume, 500);
            }
            setIsPlaying(true);
            if (isMuted) {
                setIsMuted(false);
                howlRef.current?.mute(false);
            }
        }
    }, [isPlaying, currentTrack, volume, isMuted, loadHowler, playTrack]);

    const toggleMute = useCallback(async () => {
        if (isMuted) {
            setIsMuted(false);
            // Load Howler and start playing when user unmutes
            await loadHowler();

            if (howlRef.current) {
                howlRef.current.mute(false);
                if (isPlaying) {
                    howlRef.current.volume(volume);
                }
            }

            if (!isPlaying) {
                // Auto-play on unmute if it was an initial "start"
                await togglePlay();
            }
        } else {
            setIsMuted(true);
            howlRef.current?.mute(true);
        }
    }, [isMuted, isPlaying, volume, loadHowler, togglePlay]);

    const updateVolume = useCallback((val: number) => {
        setVolume(val);
        howlRef.current?.volume(val);
    }, []);

    // Play domain-specific sound effect (one-shot)
    const playDomainEffect = useCallback(async (domain: string) => {
        if (isMuted) return;

        const Howl = await loadHowler();
        if (!Howl) return;

        const normalizedDomain = domain.toLowerCase();
        const src = DOMAIN_EFFECTS[normalizedDomain];
        if (!src) return;

        const effect = new Howl({
            src: [src],
            volume: volume * 0.7, // Effects slightly quieter than ambient
            onloaderror: () => {
                // Silently fail if effect file doesn't exist
            }
        });
        effect.once('end', () => effect.unload());
        effect.play();
    }, [isMuted, volume, loadHowler]);

    // Play UI sound effect (one-shot)
    const playUISound = useCallback(async (sound: 'click' | 'hover' | 'achievement' | 'success' | 'error' | 'page-turn') => {
        if (isMuted) return;

        const Howl = await loadHowler();
        if (!Howl) return;

        const src = UI_SOUNDS[sound];
        if (!src) return;

        const effect = new Howl({
            src: [src],
            volume: volume * 0.5, // UI sounds even quieter
            onloaderror: () => {
                // Silently fail if sound file doesn't exist
            }
        });
        effect.once('end', () => effect.unload());
        effect.play();
    }, [isMuted, volume, loadHowler]);

    return (
        <AudioContext.Provider value={{
            isPlaying,
            isMuted,
            volume,
            currentTrack,
            isLoading,
            togglePlay,
            toggleMute,
            setVolume: updateVolume,
            playPantheonTrack: playTrack,
            playDomainEffect,
            playUISound,
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
