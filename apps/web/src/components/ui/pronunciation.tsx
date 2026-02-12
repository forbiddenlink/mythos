"use client"

import * as React from "react"
import { Volume2, VolumeX, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card"

export interface Pronunciation {
  ipa: string
  phonetic: string
  audioUrl?: string
}

interface PronunciationDisplayProps {
  pronunciation: Pronunciation
  className?: string
}

export function PronunciationDisplay({
  pronunciation,
  className,
}: PronunciationDisplayProps) {
  const [copied, setCopied] = React.useState(false)
  const [audioSupported] = React.useState(false) // Future: check if audioUrl exists and is playable

  const handleCopyIPA = async () => {
    try {
      await navigator.clipboard.writeText(pronunciation.ipa)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy IPA:", err)
    }
  }

  const handlePlayAudio = () => {
    // Future: implement audio playback
    // if (pronunciation.audioUrl) {
    //   const audio = new Audio(pronunciation.audioUrl)
    //   audio.play()
    // }
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-help",
            className
          )}
          aria-label={`Pronunciation: ${pronunciation.phonetic}`}
        >
          <span className="font-mono text-sm">[{pronunciation.phonetic}]</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
              Pronunciation Guide
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click the phonetic spelling for more details
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Phonetic
              </span>
              <span className="font-mono text-sm font-medium text-slate-800 dark:text-slate-200">
                {pronunciation.phonetic}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                IPA
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
                  {pronunciation.ipa}
                </span>
                <button
                  onClick={handleCopyIPA}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Copy IPA to clipboard"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePlayAudio}
              disabled={!audioSupported}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-sm transition-colors",
                audioSupported
                  ? "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              )}
              aria-label={audioSupported ? "Play pronunciation" : "Audio not available"}
            >
              {audioSupported ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span>Play Audio</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>Audio Coming Soon</span>
                </>
              )}
            </button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

export { PronunciationDisplay as Pronunciation }
