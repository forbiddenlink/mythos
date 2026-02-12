/**
 * Background Sync Service Worker Extension for Mythos Atlas
 *
 * This file is imported by the main service worker via importScripts.
 * It adds background sync functionality for progress data.
 */

// IndexedDB Configuration
const SYNC_DB_NAME = 'mythos-atlas-sync';
const SYNC_DB_VERSION = 1;
const SYNC_STORE_NAME = 'sync-queue';
const PROGRESS_STORE_NAME = 'progress-snapshots';

// Background Sync tag
const SYNC_TAG = 'progress-sync';

/**
 * Open IndexedDB connection
 */
function openSyncDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create sync queue store
      if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
        const syncStore = db.createObjectStore(SYNC_STORE_NAME, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      // Create progress snapshots store
      if (!db.objectStoreNames.contains(PROGRESS_STORE_NAME)) {
        const progressStore = db.createObjectStore(PROGRESS_STORE_NAME, { keyPath: 'id' });
        progressStore.createIndex('timestamp', 'timestamp', { unique: false });
        progressStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

/**
 * Get all queued items from IndexedDB
 */
async function getSyncQueuedItems() {
  const db = await openSyncDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readonly');
    const store = transaction.objectStore(SYNC_STORE_NAME);
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
async function removeSyncQueuedItem(id) {
  const db = await openSyncDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Update a queued item
 */
async function updateSyncQueuedItem(item) {
  const db = await openSyncDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(SYNC_STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Process the sync queue
 * Since there's no backend, this sends progress updates to open tabs via postMessage
 */
async function processProgressSyncQueue() {
  const queuedItems = await getSyncQueuedItems();
  let processed = 0;
  let failed = 0;

  for (const item of queuedItems) {
    try {
      // Send to all open tabs to merge the progress data
      const clients = await self.clients.matchAll({ type: 'window' });

      if (clients.length > 0) {
        for (const client of clients) {
          client.postMessage({
            type: 'SYNC_PROGRESS_UPDATE',
            data: item.data,
          });
        }
      }

      await removeSyncQueuedItem(item.id);
      processed++;
    } catch (error) {
      console.error(`[SW-Sync] Failed to process sync item ${item.id}:`, error);
      // Update attempt count
      item.attempts = (item.attempts || 0) + 1;
      item.lastAttempt = Date.now();
      await updateSyncQueuedItem(item);
      failed++;
    }
  }

  // Notify clients that sync is complete
  const clients = await self.clients.matchAll({ type: 'window' });
  for (const client of clients) {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      processed,
      failed,
    });
  }

  return { processed, failed };
}

// Handle background sync events
self.addEventListener('sync', (event) => {
  console.log('[SW-Sync] Sync event received:', event.tag);

  if (event.tag === SYNC_TAG) {
    event.waitUntil(
      processProgressSyncQueue()
        .then((result) => {
          console.log('[SW-Sync] Sync completed:', result);
        })
        .catch((error) => {
          console.error('[SW-Sync] Sync failed:', error);
          throw error; // Re-throw to trigger retry
        })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'TRIGGER_SYNC') {
    console.log('[SW-Sync] Manual sync triggered');
    processProgressSyncQueue()
      .then((result) => {
        if (event.source) {
          event.source.postMessage({
            type: 'SYNC_COMPLETE',
            ...result,
          });
        }
      })
      .catch((error) => {
        console.error('[SW-Sync] Manual sync failed:', error);
      });
  }
});

// Handle periodic sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW-Sync] Periodic sync event:', event.tag);

  if (event.tag === 'progress-periodic-sync') {
    event.waitUntil(processProgressSyncQueue());
  }
});

console.log('[SW-Sync] Background sync extension loaded');
