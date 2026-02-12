'use client';

import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';

export type BookmarkType = 'deity' | 'story' | 'pantheon';

export interface Bookmark {
  type: BookmarkType;
  id: string;
  timestamp: number;
}

export interface ReadingProgress {
  storyId: string;
  percentage: number;
  updatedAt: number;
}

export interface BookmarksContextValue {
  bookmarks: Bookmark[];
  readingProgress: Record<string, ReadingProgress>;
  toggleBookmark: (type: BookmarkType, id: string) => void;
  isBookmarked: (type: BookmarkType, id: string) => boolean;
  getBookmarks: (type?: BookmarkType) => Bookmark[];
  getReadingProgress: (storyId: string) => number;
  setReadingProgress: (storyId: string, percentage: number) => void;
}

const BOOKMARKS_STORAGE_KEY = 'mythos-atlas-bookmarks';
const READING_PROGRESS_STORAGE_KEY = 'mythos-atlas-reading-progress';

export const BookmarksContext = createContext<BookmarksContextValue | null>(null);

function loadBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadReadingProgress(): Record<string, ReadingProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveBookmarks(bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // localStorage might be full or unavailable
  }
}

function saveReadingProgress(progress: Record<string, ReadingProgress>) {
  try {
    localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [readingProgress, setReadingProgressState] = useState<Record<string, ReadingProgress>>({});
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: load from localStorage on client mount
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional hydration pattern
  useEffect(() => {
    setBookmarks(loadBookmarks());
    setReadingProgressState(loadReadingProgress());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveBookmarks(bookmarks);
    }
  }, [bookmarks, mounted]);

  useEffect(() => {
    if (mounted) {
      saveReadingProgress(readingProgress);
    }
  }, [readingProgress, mounted]);

  const toggleBookmark = useCallback((type: BookmarkType, id: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.type === type && b.id === id);
      if (exists) {
        return prev.filter((b) => !(b.type === type && b.id === id));
      }
      return [...prev, { type, id, timestamp: Date.now() }];
    });
  }, []);

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) => {
      return bookmarks.some((b) => b.type === type && b.id === id);
    },
    [bookmarks]
  );

  const getBookmarks = useCallback(
    (type?: BookmarkType) => {
      if (!type) return bookmarks;
      return bookmarks.filter((b) => b.type === type);
    },
    [bookmarks]
  );

  const getReadingProgress = useCallback(
    (storyId: string) => {
      return readingProgress[storyId]?.percentage ?? 0;
    },
    [readingProgress]
  );

  const setReadingProgress = useCallback((storyId: string, percentage: number) => {
    setReadingProgressState((prev) => ({
      ...prev,
      [storyId]: {
        storyId,
        percentage: Math.min(100, Math.max(0, percentage)),
        updatedAt: Date.now(),
      },
    }));
  }, []);

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        readingProgress,
        toggleBookmark,
        isBookmarked,
        getBookmarks,
        getReadingProgress,
        setReadingProgress,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}
