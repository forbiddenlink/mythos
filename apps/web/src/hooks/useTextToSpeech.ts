'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useTextToSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [hasBrowserSupport, setHasBrowserSupport] = useState(false);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthesisRef.current = window.speechSynthesis;
            setHasBrowserSupport(true);
        }
    }, []);

    const cancel = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!synthesisRef.current) return;

        // Cancel any current speech
        cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Try to find a good voice
        const voices = synthesisRef.current.getVoices();
        // Prefer a "classical" or "solemn" voice if possible (often UK English)
        const preferredVoice = voices.find(v =>
            v.name.includes('Google UK English Male') ||
            v.name.includes('Daniel') || // iOS
            v.lang === 'en-GB'
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        // Slow down slightly for storytelling effect
        utterance.rate = 0.9;
        utterance.pitch = 0.95;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
            setIsPaused(false);
        };

        synthesisRef.current.speak(utterance);
    }, [cancel]);

    const pause = useCallback(() => {
        if (synthesisRef.current && !isPaused && isSpeaking) {
            synthesisRef.current.pause();
            setIsPaused(true);
        }
    }, [isSpeaking, isPaused]);

    const resume = useCallback(() => {
        if (synthesisRef.current && isPaused) {
            synthesisRef.current.resume();
            setIsPaused(false);
        }
    }, [isPaused]);

    return {
        speak,
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        hasBrowserSupport
    };
}
