'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- track client hydration
    setMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide the reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything on server or when online and not showing reconnected message
  if (!mounted || (isOnline && !showReconnected)) {
    return null;
  }

  return (
    <output
      className={cn(
        'fixed top-0 left-0 right-0 z-100 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300',
        isOnline
          ? 'bg-green-600 text-white animate-in slide-in-from-top-2'
          : 'bg-amber-600 text-white animate-in slide-in-from-top-2'
      )}
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Cached content is available.</span>
        </>
      )}
    </output>
  );
}
