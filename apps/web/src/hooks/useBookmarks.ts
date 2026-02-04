'use client';

import { useContext } from 'react';
import { BookmarksContext, type BookmarksContextValue } from '@/providers/bookmarks-provider';

export function useBookmarks(): BookmarksContextValue {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
