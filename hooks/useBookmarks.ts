import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addBookmarkToList,
  deleteBookmarkFromList,
  editBookmarkInList,
  sortBookmarks,
} from '@/core/bookmark-utils';
import { STORAGE_KEYS, DEFAULT_BOOKMARKS } from '@/core/constants';
import type { Bookmark } from '@/core/types';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const bookmarksRef = useRef<Bookmark[]>([]);

  useEffect(() => {
    browser.storage.local
      .get(STORAGE_KEYS.bookmarks)
      .then((result: Record<string, unknown>) => {
        if (result[STORAGE_KEYS.bookmarks]) {
          const storedBookmarks = result[STORAGE_KEYS.bookmarks] as Bookmark[];
          bookmarksRef.current = storedBookmarks;
          setBookmarks(storedBookmarks);
        } else {
          // First time: initialize with defaults
          const defaults = [...DEFAULT_BOOKMARKS] as unknown as Bookmark[];
          browser.storage.local.set({ [STORAGE_KEYS.bookmarks]: defaults });
          bookmarksRef.current = defaults;
          setBookmarks(defaults);
        }
      });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.bookmarks]?.newValue) {
        const updatedBookmarks = changes[STORAGE_KEYS.bookmarks].newValue as Bookmark[];
        bookmarksRef.current = updatedBookmarks;
        setBookmarks(updatedBookmarks);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const persist = useCallback((updated: Bookmark[]) => {
    browser.storage.local.set({ [STORAGE_KEYS.bookmarks]: updated });
  }, []);

  const applyBookmarks = useCallback(
    (updater: (current: Bookmark[]) => Bookmark[]) => {
      const updated = updater(bookmarksRef.current);
      bookmarksRef.current = updated;
      setBookmarks(updated);
      persist(updated);
    },
    [persist],
  );

  const addBookmark = useCallback(
    (name: string, url: string, letter?: string, color?: string) => {
      applyBookmarks((current) => addBookmarkToList(current, {
        id: crypto.randomUUID(),
        name,
        url,
        letter,
        color,
      }));
    },
    [applyBookmarks],
  );

  const editBookmark = useCallback(
    (id: string, changes: Partial<Pick<Bookmark, 'name' | 'url' | 'letter' | 'color'>>) => {
      applyBookmarks((current) => editBookmarkInList(current, id, changes));
    },
    [applyBookmarks],
  );

  const deleteBookmark = useCallback(
    (id: string) => {
      applyBookmarks((current) => deleteBookmarkFromList(current, id));
    },
    [applyBookmarks],
  );

  const sorted = sortBookmarks(bookmarks);

  return { bookmarks: sorted, addBookmark, editBookmark, deleteBookmark };
}
