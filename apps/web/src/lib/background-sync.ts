/**
 * Background Sync for Progress Data
 *
 * Handles offline queuing of progress updates and syncs them when back online.
 * Uses IndexedDB for persistent storage of queued items.
 */

import type { UserProgress } from '@/providers/progress-provider';

// IndexedDB Configuration
const DB_NAME = 'mythos-atlas-sync';
const DB_VERSION = 1;
const STORE_NAME = 'sync-queue';
const PROGRESS_STORE = 'progress-snapshots';

export interface SyncQueueItem {
  id: string;
  timestamp: number;
  type: 'progress-update';
  data: Partial<UserProgress>;
  attempts: number;
  lastAttempt?: number;
}

export interface ProgressSnapshot {
  id: string;
  timestamp: number;
  progress: UserProgress;
  synced: boolean;
}

/**
 * Open IndexedDB connection
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const syncStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // Create progress snapshots store
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        const progressStore = db.createObjectStore(PROGRESS_STORE, { keyPath: 'id' });
        progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        progressStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

/**
 * Generate a unique ID for queue items
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Register for background sync when online
 * Registers a sync event with the service worker
 */
export async function registerBackgroundSync(tag: string = 'progress-sync'): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if Background Sync API is available
    if ('sync' in registration) {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
      return true;
    } else {
      console.warn('Background Sync API not supported');
      return false;
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
    return false;
  }
}

/**
 * Queue progress for sync when offline
 * Stores the progress update in IndexedDB for later syncing
 */
export async function syncProgress(progressUpdate: Partial<UserProgress>): Promise<string> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const item: SyncQueueItem = {
      id: generateId(),
      timestamp: Date.now(),
      type: 'progress-update',
      data: progressUpdate,
      attempts: 0,
    };

    const request = store.add(item);

    request.onsuccess = () => {
      // Try to register background sync if we're online
      if (navigator.onLine) {
        registerBackgroundSync().catch(console.error);
      }
      resolve(item.id);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all queued progress items
 */
export async function getQueuedProgress(): Promise<SyncQueueItem[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Remove a queued item by ID
 */
export async function removeQueuedItem(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Update a queued item (e.g., increment attempts)
 */
export async function updateQueuedItem(item: SyncQueueItem): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Clear all queued items
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Save a progress snapshot for offline recovery
 */
export async function saveProgressSnapshot(progress: UserProgress): Promise<string> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readwrite');
    const store = transaction.objectStore(PROGRESS_STORE);

    const snapshot: ProgressSnapshot = {
      id: generateId(),
      timestamp: Date.now(),
      progress,
      synced: false,
    };

    const request = store.add(snapshot);

    request.onsuccess = () => resolve(snapshot.id);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get the latest progress snapshot
 */
export async function getLatestProgressSnapshot(): Promise<ProgressSnapshot | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PROGRESS_STORE], 'readonly');
    const store = transaction.objectStore(PROGRESS_STORE);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');

    request.onsuccess = () => {
      const cursor = request.result;
      resolve(cursor ? cursor.value : null);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get count of pending sync items
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Process sync queue (for use in service worker or when coming back online)
 * Since there's no backend, this just marks items as processed
 */
export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const queuedItems = await getQueuedProgress();
  let processed = 0;
  let failed = 0;

  for (const item of queuedItems) {
    try {
      // In a real implementation, this would send to a backend API
      // For now, we just merge with localStorage and remove from queue

      // Get current progress from localStorage
      const stored = localStorage.getItem('mythos-atlas-progress');
      if (stored) {
        const currentProgress = JSON.parse(stored);
        const mergedProgress = mergeProgress(currentProgress, item.data);
        localStorage.setItem('mythos-atlas-progress', JSON.stringify(mergedProgress));
      }

      await removeQueuedItem(item.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process sync item ${item.id}:`, error);
      // Update attempt count
      item.attempts++;
      item.lastAttempt = Date.now();
      await updateQueuedItem(item);
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Merge two progress objects, keeping the most recent/complete data
 */
function mergeProgress(current: UserProgress, update: Partial<UserProgress>): UserProgress {
  const merged: UserProgress = { ...current };

  // Merge arrays by union
  if (update.deitiesViewed) {
    merged.deitiesViewed = [...new Set([...current.deitiesViewed, ...update.deitiesViewed])];
  }
  if (update.storiesRead) {
    merged.storiesRead = [...new Set([...current.storiesRead, ...update.storiesRead])];
  }
  if (update.pantheonsExplored) {
    merged.pantheonsExplored = [...new Set([...current.pantheonsExplored, ...update.pantheonsExplored])];
  }
  if (update.locationsVisited) {
    merged.locationsVisited = [...new Set([...current.locationsVisited, ...update.locationsVisited])];
  }
  if (update.achievements) {
    merged.achievements = [...new Set([...current.achievements, ...update.achievements])];
  }

  // Merge quiz scores, keeping highest
  if (update.quizScores) {
    merged.quizScores = { ...current.quizScores };
    for (const [quizId, score] of Object.entries(update.quizScores)) {
      merged.quizScores[quizId] = Math.max(merged.quizScores[quizId] ?? 0, score);
    }
  }

  // Keep highest values for numeric fields
  if (update.dailyStreak !== undefined) {
    merged.dailyStreak = Math.max(current.dailyStreak, update.dailyStreak);
  }
  if (update.totalXP !== undefined) {
    merged.totalXP = Math.max(current.totalXP, update.totalXP);
  }

  // Keep most recent date
  if (update.lastVisit && update.lastVisit > current.lastVisit) {
    merged.lastVisit = update.lastVisit;
  }

  return merged;
}
