'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { usePathname } from 'next/navigation';

// Placeholder tracks - in a real app these would be actual files
// For now we'll use a silent track or a placeholder to avoid 404 console errors if files don't exist
// Ideally, the user should add these files to public/audio/
const PANTHEON_TRACKS: Record<string, string> = {
    'greek-pantheon': '/audio/greek_ambiance.mp3',
    'roman-pantheon': '/audio/roman_ambiance.mp3',
    'norse-pantheon': '/audio/norse_ambiance.mp3',
    'egyptian-pantheon': '/audio/egyptian_ambiance.mp3',
    'hindu-pantheon': '/audio/hindu_ambiance.mp3',
    'japanese-pantheon': '/audio/japanese_ambiance.mp3',
    'celtic-pantheon': '/audio/celtic_ambiance.mp3',
    'aztec-pantheon': '/audio/aztec_ambiance.mp3',
    'chinese-pantheon': '/audio/chinese_ambiance.mp3',
    'default': '/audio/mythos_theme.mp3',
};

interface AudioContextType {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    currentTrack: string | undefined;
    togglePlay: () => void;
    toggleMute: () => void;
    setVolume: (val: number) => void;
    playPantheonTrack: (pantheonId: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true); // Start muted by default for UX
    const [volume, setVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState<string>('default');

    const howlRef = useRef<Howl | null>(null);
    const pathname = usePathname();

    const playTrack = useCallback((trackKey: string) => {
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
            onloaderror: (id, err) => console.warn(`Audio load error for ${src}:`, err)
        });

        howlRef.current = newHowl;
        setCurrentTrack(trackKey);

        if (!isMuted) {
            newHowl.play();
            newHowl.fade(0, volume, 1000);
            setIsPlaying(true);
        }
    }, [currentTrack, isMuted, volume]);

    // Effect to handle navigation changes
    useEffect(() => {
        // Simple logic: check if pathname contains a pantheon slug
        // This assumes URLs like /pantheons/greek-pantheon
        // We can refine this logic later
        let foundPantheon = 'default';
        for (const key of Object.keys(PANTHEON_TRACKS)) {
            if (pathname?.includes(key)) {
                foundPantheon = key;
                break;
            }
        }

        // Only switch if different AND we are not just navigating sub-pages of same pantheon
        // actually simpler: just switch if foundPantheon differs from current *context*
        if (foundPantheon !== currentTrack && !isMuted) {
            playTrack(foundPantheon);
        }
        // Update state tracker without playing if muted
        else if (foundPantheon !== currentTrack && isMuted) {
            setCurrentTrack(foundPantheon);
        }

    }, [pathname, playTrack, currentTrack, isMuted]);

    // Handle controls
    const togglePlay = () => {
        if (isPlaying) {
            howlRef.current?.pause();
            setIsPlaying(false);
        } else {
            // If we have a track loaded, play it. If not, load current.
            if (!howlRef.current || howlRef.current.state() === 'unloaded') {
                playTrack(currentTrack || 'default');
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
    };

    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false);
            howlRef.current?.mute(false);
            // If we were "playing" but muted, ensure volume is up
            if (isPlaying && howlRef.current) {
                howlRef.current.volume(volume);
            } else if (!isPlaying) {
                // Auto-play on unmute if it was an initial "start"
                togglePlay();
            }
        } else {
            setIsMuted(true);
            howlRef.current?.mute(true);
        }
    };

    const updateVolume = (val: number) => {
        setVolume(val);
        howlRef.current?.volume(val);
    };

    return (
        <AudioContext.Provider value={{
            isPlaying,
            isMuted,
            volume,
            currentTrack,
            togglePlay,
            toggleMute,
            setVolume: updateVolume,
            playPantheonTrack: playTrack
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
