'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('mythos-pwa-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install prompt after a short delay
      setTimeout(() => setIsVisible(true), 3000);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      localStorage.setItem('mythos-pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('mythos-pwa-dismissed', 'true');
  }, []);

  if (!isVisible || isDismissed || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md',
        'rounded-xl border border-border/50 bg-card/95 p-4 shadow-2xl backdrop-blur-sm',
        'animate-in slide-in-from-bottom-4 duration-300',
        'dark:border-gold/20 dark:bg-midnight/95'
      )}
      role="dialog"
      aria-labelledby="install-prompt-title"
      aria-describedby="install-prompt-description"
    >
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Dismiss install prompt"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 dark:from-gold/30 dark:to-gold/10">
          <Download className="h-6 w-6 text-gold" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 id="install-prompt-title" className="font-semibold text-foreground">
            Install Mythos Atlas
          </h3>
          <p id="install-prompt-description" className="text-sm text-muted-foreground">
            Add to your home screen for quick access and offline reading of mythology content.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-1"
        >
          Maybe Later
        </Button>
        <Button
          variant="gold"
          size="sm"
          onClick={handleInstall}
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
      </div>
    </div>
  );
}
