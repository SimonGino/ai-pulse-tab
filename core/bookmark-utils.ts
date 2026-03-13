import { BOOKMARK_COLORS } from '@/core/constants';
import type { Bookmark } from '@/core/types';

export interface BookmarkFormErrors {
  name?: string;
  url?: string;
}

interface NewBookmarkInput {
  id: string;
  name: string;
  url: string;
  letter?: string;
  color?: string;
}

export function validateBookmarkForm(name: string, url: string): BookmarkFormErrors {
  const errors: BookmarkFormErrors = {};
  const trimmedName = name.trim();
  const trimmedUrl = url.trim();

  if (!trimmedName) {
    errors.name = 'Name is required';
  }

  if (!trimmedUrl) {
    errors.url = 'URL is required';
  } else {
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Unsupported bookmark URL protocol');
      }
    } catch {
      errors.url = 'Please enter a valid URL using http:// or https://';
    }
  }

  return errors;
}

export function normalizeBookmarkLetter(value: string): string {
  return value.slice(0, 1).toUpperCase();
}

export function deriveBookmarkLetter(name: string, letter?: string): string {
  return normalizeBookmarkLetter(letter ?? '') || normalizeBookmarkLetter(name) || '?';
}

export function addBookmarkToList(
  bookmarks: Bookmark[],
  { id, name, url, letter, color }: NewBookmarkInput,
): Bookmark[] {
  const maxOrder = bookmarks.reduce((max, bookmark) => Math.max(max, bookmark.order), -1);

  return [
    ...bookmarks,
    {
      id,
      name,
      url,
      letter: deriveBookmarkLetter(name, letter),
      color: color || BOOKMARK_COLORS[bookmarks.length % BOOKMARK_COLORS.length],
      order: maxOrder + 1,
    },
  ];
}

export function editBookmarkInList(
  bookmarks: Bookmark[],
  id: string,
  changes: Partial<Pick<Bookmark, 'name' | 'url' | 'letter' | 'color'>>,
): Bookmark[] {
  return bookmarks.map((bookmark) => (bookmark.id === id ? { ...bookmark, ...changes } : bookmark));
}

export function deleteBookmarkFromList(bookmarks: Bookmark[], id: string): Bookmark[] {
  return bookmarks.filter((bookmark) => bookmark.id !== id);
}

export function sortBookmarks(bookmarks: Bookmark[]): Bookmark[] {
  return [...bookmarks].sort((left, right) => left.order - right.order);
}

export function shouldCloseBookmarkContextMenu(
  menu: { contains(target: unknown): boolean } | null,
  target: EventTarget | null,
): boolean {
  if (!menu || !target) {
    return false;
  }

  return !menu.contains(target);
}

export function updateCollapsedProvidersMap(
  current: Record<string, boolean>,
  providerName: string,
  collapsed: boolean,
): Record<string, boolean> {
  return {
    ...current,
    [providerName]: collapsed,
  };
}
