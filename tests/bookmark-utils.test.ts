import test from 'node:test';
import assert from 'node:assert/strict';

import { BOOKMARK_COLORS } from '../core/constants.ts';
import type { Bookmark } from '../core/types.ts';
import {
  addBookmarkToList,
  deleteBookmarkFromList,
  editBookmarkInList,
  normalizeBookmarkLetter,
  shouldCloseBookmarkContextMenu,
  sortBookmarks,
  updateCollapsedProvidersMap,
  validateBookmarkForm,
} from '../core/bookmark-utils.ts';

const existingBookmarks: Bookmark[] = [
  {
    id: 'bookmark-1',
    name: 'Claude',
    url: 'https://claude.ai',
    letter: 'C',
    color: BOOKMARK_COLORS[0],
    order: 0,
  },
  {
    id: 'bookmark-2',
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    letter: 'G',
    color: BOOKMARK_COLORS[1],
    order: 1,
  },
];

test('validateBookmarkForm rejects blank, malformed, and unsupported bookmark URLs', () => {
  assert.deepEqual(validateBookmarkForm('', ''), {
    name: 'Name is required',
    url: 'URL is required',
  });

  assert.deepEqual(validateBookmarkForm('GitHub', 'github.com'), {
    url: 'Please enter a valid URL using http:// or https://',
  });

  assert.deepEqual(validateBookmarkForm('GitHub', 'javascript:alert(1)'), {
    url: 'Please enter a valid URL using http:// or https://',
  });

  assert.deepEqual(validateBookmarkForm('GitHub', 'https://github.com'), {});
});

test('normalizeBookmarkLetter keeps a single uppercase character', () => {
  assert.equal(normalizeBookmarkLetter('ab'), 'A');
  assert.equal(normalizeBookmarkLetter('z'), 'Z');
  assert.equal(normalizeBookmarkLetter(''), '');
});

test('addBookmarkToList appends with fallback letter, color, and order from current state', () => {
  const updated = addBookmarkToList(existingBookmarks, {
    id: 'bookmark-3',
    name: 'gemini',
    url: 'https://gemini.google.com',
  });

  assert.equal(updated.length, 3);
  assert.deepEqual(updated[2], {
    id: 'bookmark-3',
    name: 'gemini',
    url: 'https://gemini.google.com',
    letter: 'G',
    color: BOOKMARK_COLORS[2],
    order: 2,
  });
});

test('editBookmarkInList updates only the matching bookmark', () => {
  const updated = editBookmarkInList(existingBookmarks, 'bookmark-2', {
    name: 'OpenAI',
    letter: 'O',
  });

  assert.equal(updated[0].name, 'Claude');
  assert.deepEqual(updated[1], {
    ...existingBookmarks[1],
    name: 'OpenAI',
    letter: 'O',
  });
});

test('deleteBookmarkFromList removes only the matching bookmark', () => {
  const updated = deleteBookmarkFromList(existingBookmarks, 'bookmark-1');

  assert.deepEqual(updated, [existingBookmarks[1]]);
});

test('sortBookmarks returns ascending order without mutating the source array', () => {
  const unsorted: Bookmark[] = [
    { ...existingBookmarks[1] },
    { ...existingBookmarks[0] },
  ];

  const sorted = sortBookmarks(unsorted);

  assert.deepEqual(sorted.map((bookmark) => bookmark.id), ['bookmark-1', 'bookmark-2']);
  assert.deepEqual(unsorted.map((bookmark) => bookmark.id), ['bookmark-2', 'bookmark-1']);
});

test('shouldCloseBookmarkContextMenu only closes for clicks outside the menu', () => {
  const insideTarget = new EventTarget();
  const outsideTarget = new EventTarget();
  const menu = {
    contains(target: unknown) {
      return target === insideTarget;
    },
  };

  assert.equal(shouldCloseBookmarkContextMenu(menu, insideTarget), false);
  assert.equal(shouldCloseBookmarkContextMenu(menu, outsideTarget), true);
  assert.equal(shouldCloseBookmarkContextMenu(null, outsideTarget), false);
});

test('updateCollapsedProvidersMap keeps sibling provider state intact', () => {
  assert.deepEqual(
    updateCollapsedProvidersMap({ Claude: true }, 'ChatGPT', false),
    { Claude: true, ChatGPT: false },
  );
});
