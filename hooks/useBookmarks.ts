import { useEffect, useState, useCallback } from 'react';
import { STORAGE_KEYS, DEFAULT_BOOKMARKS, BOOKMARK_COLORS } from '@/core/constants';
import type { Bookmark } from '@/core/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    browser.storage.local
      .get(STORAGE_KEYS.bookmarks)
      .then((result: Record<string, unknown>) => {
        if (result[STORAGE_KEYS.bookmarks]) {
          setBookmarks(result[STORAGE_KEYS.bookmarks] as Bookmark[]);
        } else {
          // First time: initialize with defaults
          const defaults = [...DEFAULT_BOOKMARKS] as unknown as Bookmark[];
          browser.storage.local.set({ [STORAGE_KEYS.bookmarks]: defaults });
          setBookmarks(defaults);
        }
      });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.bookmarks]?.newValue) {
        setBookmarks(changes[STORAGE_KEYS.bookmarks].newValue as Bookmark[]);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const persist = useCallback((updated: Bookmark[]) => {
    browser.storage.local.set({ [STORAGE_KEYS.bookmarks]: updated });
  }, []);

  const addBookmark = useCallback(
    (name: string, url: string, letter?: string, color?: string) => {
      const maxOrder = bookmarks.reduce((max, b) => Math.max(max, b.order), -1);
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        name,
        url,
        letter: letter || name.charAt(0).toUpperCase(),
        color: color || BOOKMARK_COLORS[bookmarks.length % BOOKMARK_COLORS.length],
        order: maxOrder + 1,
      };
      const updated = [...bookmarks, newBookmark];
      setBookmarks(updated);
      persist(updated);
    },
    [bookmarks, persist],
  );

  const editBookmark = useCallback(
    (id: string, changes: Partial<Pick<Bookmark, 'name' | 'url' | 'letter' | 'color'>>) => {
      const updated = bookmarks.map((b) => (b.id === id ? { ...b, ...changes } : b));
      setBookmarks(updated);
      persist(updated);
    },
    [bookmarks, persist],
  );

  const deleteBookmark = useCallback(
    (id: string) => {
      const updated = bookmarks.filter((b) => b.id !== id);
      setBookmarks(updated);
      persist(updated);
    },
    [bookmarks, persist],
  );

  const sorted = [...bookmarks].sort((a, b) => a.order - b.order);

  return { bookmarks: sorted, addBookmark, editBookmark, deleteBookmark };
}
