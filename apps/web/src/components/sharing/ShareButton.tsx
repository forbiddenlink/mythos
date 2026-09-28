"use client";

import { useState, useCallback, useEffect } from "react";
import { Popover } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Share2, Link2, Check } from "lucide-react";
import { Twitter, Facebook, Linkedin } from "@/components/icons/brand";
import { trackEvent } from "@/lib/analytics/events";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  /** Where this button lives, so shares can be attributed to a surface. */
  surface?: string;
}

/**
 * ShareButton component for sharing content to social media platforms.
 * Uses native Web Share API on mobile with fallback to individual buttons on desktop.
 */
export function ShareButton({
  title,
  text,
  url,
  className,
  surface = "unknown",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(url ?? "");
  // Defer native-share detection until mount so SSR and client HTML match
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      // Hydrate the share URL from window on mount, so SSR output stays stable.
      setShareUrl(window.location.href);
    }
    // Prefer the in-page menu on fine-pointer (desktop) devices even when
    // navigator.share exists — the native sheet is mainly useful on mobile.
    const canNativeShare =
      typeof navigator !== "undefined" &&
      Boolean(navigator.share) &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    setHasNativeShare(canNativeShare);
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        trackEvent("share_clicked", { surface, method: "native" });
      } catch (error) {
        // User cancelled or share failed, show fallback
        if ((error as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  }, [title, text, shareUrl, surface]);

  const handleCopyLink = useCallback(async () => {
    setCopied(false);
    setCopyFailed(false);
    let succeeded = false;
    try {
      await navigator.clipboard.writeText(shareUrl);
      succeeded = true;
    } catch {
      const focused = document.activeElement;
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      // Keep fallback focus inside the popover so copying does not dismiss it.
      const container =
        focused instanceof HTMLElement
          ? (focused.closest('[role="dialog"]') ?? document.body)
          : document.body;
      container.appendChild(textArea);
      try {
        textArea.select();
        succeeded = document.execCommand("copy");
      } catch {
        succeeded = false;
      } finally {
        textArea.remove();
        if (focused instanceof HTMLElement) focused.focus();
      }
    }
    if (succeeded) {
      trackEvent("share_clicked", { surface, method: "copy_link" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyFailed(true);
    }
  }, [shareUrl, surface]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    trackEvent("share_clicked", { surface, method: "twitter" });
    window.open(
      twitterUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [text, shareUrl, surface]);

  const handleFacebookShare = useCallback(() => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    trackEvent("share_clicked", { surface, method: "facebook" });
    window.open(
      facebookUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [text, shareUrl, surface]);

  const handleLinkedInShare = useCallback(() => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    trackEvent("share_clicked", { surface, method: "linkedin" });
    window.open(
      linkedInUrl,
      "_blank",
      "noopener,noreferrer,width=550,height=420",
    );
  }, [shareUrl, surface]);

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

  // The existing Radix primitive keeps the panel within the viewport and
  // handles Escape, outside interaction and focus restoration.
  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn("relative", className)}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-gold/30 hover:bg-gold/10 hover:border-gold/50 text-foreground"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            aria-label="Share this entry"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            className="z-50 w-64 max-w-[calc(100vw-2rem)] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto rounded-lg border border-gold/20 bg-background/95 backdrop-blur-sm shadow-lg p-2"
          >
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
            {copyFailed && (
              <div role="alert" className="px-3 py-2 text-sm">
                <p>Copy failed. Select and copy the link below.</p>
                <input
                  aria-label="Link to copy manually"
                  readOnly
                  value={shareUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="mt-2 w-full min-w-0 rounded border border-border bg-background p-2 text-foreground"
                />
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </div>
    </Popover.Root>
  );
}
