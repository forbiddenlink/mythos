'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { UserProgress } from '@/providers/progress-provider';
import {
  registerBackgroundSync,
  syncProgress,
  getQueuedProgress,
  processSyncQueue,
  getPendingSyncCount,
  type SyncQueueItem,
} from '@/lib/background-sync';

export interface BackgroundSyncState {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

export interface UseBackgroundSyncReturn {
  state: BackgroundSyncState;
  queueProgressUpdate: (update: Partial<UserProgress>) => Promise<void>;
  syncNow: () => Promise<void>;
  getQueuedItems: () => Promise<SyncQueueItem[]>;
}

/**
 * Hook for managing background sync of progress data
 *
 * Features:
 * - Detects online/offline status
 * - Queues progress changes when offline
 * - Automatically syncs when back online
 * - Provides sync status and pending count
 */
export function useBackgroundSync(): UseBackgroundSyncReturn {
  const [state, setState] = useState<BackgroundSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncTime: null,
    error: null,
  });

  const syncInProgressRef = useRef(false);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setState(prev => ({ ...prev, pendingCount: count }));
    } catch (error) {
      console.error('Failed to get pending sync count:', error);
    }
  }, []);

  // Process the sync queue
  const syncNow = useCallback(async () => {
    if (syncInProgressRef.current) return;
    if (!navigator.onLine) {
      setState(prev => ({ ...prev, error: 'Cannot sync while offline' }));
      return;
    }

    syncInProgressRef.current = true;
    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      const result = await processSyncQueue();
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingCount: result.failed,
        error: result.failed > 0 ? `${result.failed} items failed to sync` : null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    } finally {
      syncInProgressRef.current = false;
    }
  }, []);

  // Queue a progress update for sync
  const queueProgressUpdate = useCallback(async (update: Partial<UserProgress>) => {
    try {
      await syncProgress(update);
      await updatePendingCount();

      // If online, try to sync immediately
      if (navigator.onLine) {
        await syncNow();
      } else {
        // Register for background sync when we come back online
        await registerBackgroundSync();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to queue update',
      }));
    }
  }, [updatePendingCount, syncNow]);

  // Get queued items
  const getQueuedItems = useCallback(async (): Promise<SyncQueueItem[]> => {
    try {
      return await getQueuedProgress();
    } catch (error) {
      console.error('Failed to get queued items:', error);
      return [];
    }
  }, []);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Sync when coming back online
      syncNow();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial state
    setState(prev => ({ ...prev, isOnline: navigator.onLine }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncNow]);

  // Update pending count on mount
  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Listen for service worker sync events
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SYNC_COMPLETE') {
          updatePendingCount();
          setState(prev => ({
            ...prev,
            lastSyncTime: Date.now(),
            isSyncing: false,
          }));
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [updatePendingCount]);

  return {
    state,
    queueProgressUpdate,
    syncNow,
    getQueuedItems,
  };
}
