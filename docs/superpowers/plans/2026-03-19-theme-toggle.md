# Theme Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-mode theme toggle (dark / light / system) with CSS variable overrides, persistence, and flash prevention.

**Architecture:** Dark theme stays as `:root` default. Light theme applied via `[data-theme="light"]` CSS selector on `<html>`. A pre-React script reads the stored preference and sets the attribute before first paint. React hook manages runtime switching and OS theme detection.

**Tech Stack:** React 19, TypeScript, CSS custom properties, chrome.storage.local, WXT

**Spec:** `docs/superpowers/specs/2026-03-19-theme-toggle-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `core/types.ts` | Edit | Add `Theme` type |
| `core/constants.ts` | Edit | Add `theme` storage key |
| `entrypoints/newtab/style.css` | Edit | Add `[data-theme="light"]` overrides + `.theme-toggle` class |
| `public/theme-init.js` | Create | Flash-prevention script (plain JS, copied to build output) |
| `entrypoints/newtab/index.html` | Edit | Add theme-init script ref, set `data-theme="dark"` on `<html>` |
| `hooks/useTheme.ts` | Create | Theme state management hook |
| `components/ThemeToggle.tsx` | Create | Toggle button component |
| `entrypoints/newtab/App.tsx` | Edit | Wrap greeting with flex container, add ThemeToggle |

---

### Task 1: Foundation — Type + Storage Key

**Files:**
- Edit: `core/types.ts`
- Edit: `core/constants.ts`

- [ ] **Step 1: Add Theme type to types.ts**

Add at the end of `core/types.ts`, after the `TodoItem` interface:

```ts
export type Theme = 'dark' | 'light' | 'system';
```

- [ ] **Step 2: Add theme storage key to constants.ts**

Add `theme: 'theme'` to the `STORAGE_KEYS` object in `core/constants.ts`:

```ts
export const STORAGE_KEYS = {
  usageData: 'usageData',
  lastUpdated: 'lastUpdated',
  bookmarks: 'bookmarks',
  collapsedProviders: 'collapsedProviders',
  todos: 'todos',
  theme: 'theme',
} as const;
```

- [ ] **Step 3: Commit**

```bash
git add core/types.ts core/constants.ts
git commit -m "feat: add Theme type and theme storage key"
```

---

### Task 2: CSS — Light Theme Overrides + Toggle Button

**Files:**
- Edit: `entrypoints/newtab/style.css`

- [ ] **Step 1: Add light theme overrides and toggle button class**

Append the following to the end of `entrypoints/newtab/style.css`:

```css
/* === Theme Toggle Button === */
.theme-toggle {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--card);
  border: 0.5px solid var(--bd);
  font-size: 14px;
  color: var(--t2);
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.theme-toggle:hover { background: var(--card-h); }

/* === Light Theme === */
[data-theme="light"] {
  --bg: #ffffff;
  --card: #fafafa;
  --card-h: #f0f0f0;
  --inp: #f5f5f5;
  --t1: #111111;
  --t2: #999999;
  --t3: #bbbbbb;
  --bd: #eeeeee;
}

[data-theme="light"] .seg.empty { background: rgba(0,0,0,0.06); }

[data-theme="light"] .usage-col::-webkit-scrollbar-thumb,
[data-theme="light"] .right-col::-webkit-scrollbar-thumb,
[data-theme="light"] .todo-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }

[data-theme="light"] .todo-item:hover { background: rgba(0,0,0,0.03); }

[data-theme="light"] .dial-add { border: 1px dashed rgba(0,0,0,0.12); }
[data-theme="light"] .dial-add .dial-ico { background: rgba(0,0,0,0.04); }

[data-theme="light"] .pri-btn.sel { outline: 1.5px solid rgba(0,0,0,0.2); }

[data-theme="light"] .todo-inp:focus { border-color: rgba(0,0,0,0.15); }
[data-theme="light"] .modal-input:focus { border-color: rgba(0,0,0,0.15); }

[data-theme="light"] .u-refresh:hover { background: rgba(0,0,0,0.04); }

[data-theme="light"] .todo-add { background: rgba(0,0,0,0.04); }
[data-theme="light"] .todo-add:hover { background: rgba(0,0,0,0.06); }

[data-theme="light"] .ctx-menu button:hover { background: rgba(0,0,0,0.04); }

[data-theme="light"] .modal-btn:hover { background: rgba(0,0,0,0.04); }
[data-theme="light"] .modal-btn-primary { background: rgba(0,0,0,0.08); }

[data-theme="light"] .t-chk.dn::after {
  border-left-color: #ffffff;
  border-bottom-color: #ffffff;
}

[data-theme="light"] .modal-overlay { background: rgba(0,0,0,0.4); }
```

- [ ] **Step 2: Commit**

```bash
git add entrypoints/newtab/style.css
git commit -m "feat: add light theme CSS overrides and toggle button class"
```

---

### Task 3: Flash Prevention — Theme Init Script + HTML

**Files:**
- Create: `public/theme-init.js`
- Edit: `entrypoints/newtab/index.html`

- [ ] **Step 1: Create public/theme-init.js**

Create `public/theme-init.js` (plain JS, not TypeScript — placed in `public/` so WXT copies it as-is to the build root). Note: the spec suggests `entrypoints/newtab/theme-init.ts`, but WXT does not bundle arbitrary `.ts` files inside entrypoint directories as separate scripts. `public/` is the correct approach.

```js
// Flash-prevention: read theme preference and set data-theme before React renders.
// This file is loaded as a regular <script> (not module) in <head>.
(function () {
  // IMPORTANT: This key must match STORAGE_KEYS.theme in core/constants.ts
  var STORAGE_KEY = 'theme';

  chrome.storage.local.get(STORAGE_KEY, function (result) {
    var theme = result[STORAGE_KEY] || 'dark';
    var resolved = theme;

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    document.documentElement.dataset.theme = resolved;
  });
})();
```

- [ ] **Step 2: Update index.html**

Edit `entrypoints/newtab/index.html` to:
1. Add `data-theme="dark"` on `<html>` as default
2. Add `<script src="/theme-init.js"></script>` in `<head>` before the React script

```html
<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Tab</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <script src="/theme-init.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add public/theme-init.js entrypoints/newtab/index.html
git commit -m "feat: add flash-prevention theme init script"
```

---

### Task 4: useTheme Hook

**Files:**
- Create: `hooks/useTheme.ts`

- [ ] **Step 1: Create hooks/useTheme.ts**

```ts
import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/core/constants';
import type { Theme } from '@/core/types';

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme;
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = resolveTheme(theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Load stored preference
    browser.storage.local
      .get(STORAGE_KEYS.theme)
      .then((result: Record<string, unknown>) => {
        const stored = (result[STORAGE_KEYS.theme] as Theme) || 'dark';
        setThemeState(stored);
        applyTheme(stored);
      });

    // Listen for cross-tab changes
    const storageListener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.theme]?.newValue) {
        const updated = changes[STORAGE_KEYS.theme].newValue as Theme;
        setThemeState(updated);
        applyTheme(updated);
      }
    };
    browser.storage.local.onChanged.addListener(storageListener);

    // Listen for OS theme changes (for 'system' mode)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const mediaListener = () => {
      // Re-read current theme from state is stale in closure,
      // so read from storage directly
      browser.storage.local
        .get(STORAGE_KEYS.theme)
        .then((result: Record<string, unknown>) => {
          const current = (result[STORAGE_KEYS.theme] as Theme) || 'dark';
          if (current === 'system') {
            applyTheme('system');
          }
        });
    };
    mediaQuery.addEventListener('change', mediaListener);

    return () => {
      browser.storage.local.onChanged.removeListener(storageListener);
      mediaQuery.removeEventListener('change', mediaListener);
    };
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    browser.storage.local.set({ [STORAGE_KEYS.theme]: newTheme });
  }, []);

  return { theme, setTheme };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useTheme.ts
git commit -m "feat: add useTheme hook with persistence and OS theme detection"
```

---

### Task 5: ThemeToggle Component

**Files:**
- Create: `components/ThemeToggle.tsx`

- [ ] **Step 1: Create components/ThemeToggle.tsx**

```tsx
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/core/types';

const THEME_CYCLE: Theme[] = ['dark', 'light', 'system'];

const THEME_ICONS: Record<Theme, string> = {
  dark: '\u263E',   // ☾
  light: '\u2600',  // ☀
  system: '\u25D0', // ◐
};

const THEME_LABELS: Record<Theme, string> = {
  dark: 'Theme: dark',
  light: 'Theme: light',
  system: 'Theme: system',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    const currentIndex = THEME_CYCLE.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
    setTheme(THEME_CYCLE[nextIndex]);
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleClick}
      aria-label={THEME_LABELS[theme]}
      title={THEME_LABELS[theme]}
    >
      {THEME_ICONS[theme]}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component with dark/light/system cycling"
```

---

### Task 6: Integration — Wire ThemeToggle into App.tsx

**Files:**
- Edit: `entrypoints/newtab/App.tsx`

- [ ] **Step 1: Update App.tsx**

Add ThemeToggle import and wrap the `<Greeting />` in a flex container with the toggle on the right. The changes are:

1. Add import: `import { ThemeToggle } from '@/components/ThemeToggle';`
2. Replace `<Greeting />` with a flex wrapper:

In `App.tsx`, change:
```tsx
<Greeting />
```
to:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  <Greeting />
  <ThemeToggle />
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm compile`
Expected: PASS

- [ ] **Step 3: Verify build**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm build`
Expected: Build succeeds. Check that `theme-init.js` appears in `.output/chrome-mv3/`.

- [ ] **Step 4: Commit**

```bash
git add entrypoints/newtab/App.tsx
git commit -m "feat: wire ThemeToggle into App layout"
```

---

### Task 7: Verify and Fix

- [ ] **Step 1: Run existing tests**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && node --import ./tests/register-aliases.mjs --test tests/bookmark-utils.test.ts tests/claude-probe.test.ts`
Expected: All 9 tests pass.

- [ ] **Step 2: Manual visual check**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm dev`
Open the extension's new tab page and verify:
- Default is dark theme
- Click toggle: switches to light theme (white background, dark text)
- Click toggle again: switches to system mode (◐ icon, follows OS)
- Click toggle again: back to dark
- Theme persists across new tab opens
- Light mode: all cards, inputs, segments, scrollbars look correct (no white-on-white)
- Light mode: checkmark on completed todo is white on green (not dark on green)
- Modal overlay is lighter in light mode

- [ ] **Step 3: Fix any visual issues found**

Address any discrepancies.

- [ ] **Step 4: Final commit if fixes were made**

```bash
git add -A
git commit -m "fix: address visual issues from theme toggle review"
```
