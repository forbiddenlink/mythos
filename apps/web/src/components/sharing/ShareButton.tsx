"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

/**
 * ShareButton component for sharing content to social media platforms.
 * Uses native Web Share API on mobile with fallback to individual buttons on desktop.
 */
export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use current page URL if not provided
  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed, show fallback
        if ((error as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  }, [title, text, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(
      twitterUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [text, shareUrl]);

  const handleFacebookShare = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(
      facebookUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [text, shareUrl]);

  const handleLinkedInShare = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(
      linkedInUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [shareUrl]);

  // Check if native share is available (mobile devices)
  const hasNativeShare = typeof navigator !== "undefined" && navigator.share;

  // On mobile with native share support, show simple share button
  if (hasNativeShare && !isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className={cn(
          "gap-2 border-gold/30 hover:bg-gold/10 hover:border-gold/50 text-foreground",
          className,
        )}
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>
    );
  }

  // On desktop or when native share fails, show dropdown with options
  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 border-gold/30 hover:bg-gold/10 hover:border-gold/50 text-foreground"
      >
        <Share2 className="h-4 w-4" />
        <span>Share</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close on click outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Share menu */}
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[200px] rounded-lg border border-gold/20 bg-background/95 backdrop-blur-sm shadow-lg p-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => {
                handleTwitterShare();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gold/10 transition-colors"
            >
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
              <span>Share on X</span>
            </button>

            <button
              onClick={() => {
                handleFacebookShare();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gold/10 transition-colors"
            >
              <Facebook className="h-4 w-4 text-[#1877F2]" />
              <span>Share on Facebook</span>
            </button>

            <button
              onClick={() => {
                handleLinkedInShare();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gold/10 transition-colors"
            >
              <Linkedin className="h-4 w-4 text-[#0A66C2]" />
              <span>Share on LinkedIn</span>
            </button>

            <div className="my-2 h-px bg-border" />

            <button
              onClick={() => {
                handleCopyLink();
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gold/10 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">Link Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 text-gold" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
