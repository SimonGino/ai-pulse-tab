# UI Redesign + Todo List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the UI layer from pixel/retro theme to clean dark minimal, and add a Todo list feature with persistence and midnight auto-clear.

**Architecture:** CSS custom properties define the new design system (colors, radii, fonts), Tailwind utilities handle layout/spacing in JSX. New two-column layout: left (usage cards) + right (speed dial + todo). Todo data persists in `chrome.storage.local` via a new `useTodos` hook mirroring the existing `useBookmarks` pattern.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, WXT (Web Extension Toolkit), chrome.storage.local

**Spec:** `docs/superpowers/specs/2026-03-18-ui-redesign-todo-design.md`
**Prototype:** `docs/newtab-prototype.html`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `entrypoints/newtab/index.html` | Edit | Google Fonts link → DM Sans + Space Mono |
| `entrypoints/newtab/style.css` | Rewrite | New design system: CSS variables, component classes |
| `core/constants.ts` | Edit | Update provider colors, thresholds, add `todos` storage key |
| `core/types.ts` | Edit | Add `TodoItem` interface |
| `components/provider-card-layout.ts` | Remove | Replaced by new styling approach |
| `tests/provider-card-layout.test.ts` | Remove | Tests for removed file |
| `components/QuotaBar.tsx` | Rewrite | 16-segment bar with `brandColor` prop |
| `components/ResetCountdown.tsx` | Edit | Restyle to new design tokens |
| `components/ProviderCard.tsx` | Rewrite | New card styling, brand dot, plan badge |
| `components/BookmarkGrid.tsx` | Rewrite | 6-column Speed Dial grid |
| `components/BookmarkModal.tsx` | Rewrite | Modal with new design tokens |
| `hooks/useTodos.ts` | Create | Todo CRUD + persistence + midnight auto-clear |
| `components/TodoList.tsx` | Create | Todo input, list, priority, counter |
| `entrypoints/newtab/App.tsx` | Rewrite | Greeting + two-column layout + wire all components |

---

### Task 1: Foundation — Design System, Fonts, Constants

**Files:**
- Edit: `entrypoints/newtab/index.html`
- Rewrite: `entrypoints/newtab/style.css`
- Edit: `core/constants.ts`

- [ ] **Step 1: Update Google Fonts in index.html**

Replace the font links in `entrypoints/newtab/index.html`. Change the `<link>` tags to load DM Sans (400, 500, 600) and Space Mono (400, 700) instead of Press Start 2P and JetBrains Mono:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Rewrite style.css**

Replace the entire contents of `entrypoints/newtab/style.css` with the new design system. This removes all pixel-theme classes and adds the new CSS variables, component classes, and utility styles from the prototype:

```css
@import "tailwindcss";

/* === Design System === */
:root {
  --bg: #0c0f14;
  --card: rgba(255,255,255,0.04);
  --card-h: rgba(255,255,255,0.065);
  --inp: rgba(255,255,255,0.06);
  --t1: #e8e6e1;
  --t2: #8a877f;
  --t3: #5c5a54;
  --bd: rgba(255,255,255,0.06);
  --claude: #d4845a;
  --gpt: #6bc88f;
  --warn: #e8a33c;
  --danger: #e25c5c;
  --blue: #5b9bd5;
  --r: 12px;
  --rs: 8px;
}

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--t1);
  height: 100vh;
  padding: 32px 40px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  margin: 0;
}

/* === Greeting === */
.greeting { margin-bottom: 24px; flex-shrink: 0; }
.greeting .time {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--t3);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.greeting h1 { font-size: 26px; font-weight: 500; }
.greeting h1 span { color: var(--t2); font-weight: 400; }

/* === Two-Column Main === */
.main {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 28px;
  flex: 1;
  min-height: 0;
}

/* === Section Label === */
.slabel {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--t3);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.slabel::after {
  content: '';
  flex: 1;
  height: 0.5px;
  background: var(--bd);
}

/* === Left: Usage Column === */
.usage-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
}
.usage-col::-webkit-scrollbar { width: 3px; }
.usage-col::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* === Usage Card === */
.u-card {
  background: var(--card);
  border: 0.5px solid var(--bd);
  border-radius: var(--r);
  padding: 12px 14px;
}
.u-head { display: flex; align-items: center; gap: 7px; margin-bottom: 8px; }
.u-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.u-brand { font-size: 12px; font-weight: 500; flex: 1; }
.u-plan {
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  color: var(--t3);
  padding: 1px 6px;
  border: 0.5px solid var(--bd);
  border-radius: 3px;
}

/* === Quota Row === */
.u-row { margin-bottom: 6px; }
.u-row:last-child { margin-bottom: 0; }
.u-row-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2px; }
.u-row-label { font-size: 10px; color: var(--t2); font-weight: 500; }
.u-row-pct { font-size: 10px; font-family: 'Space Mono', monospace; }
.pct-ok { color: var(--gpt); }
.pct-w { color: var(--warn); }
.pct-d { color: var(--danger); }
.pct-lo { color: var(--t3); }

/* === Segment Bar === */
.seg-bar { display: flex; gap: 1.5px; height: 5px; margin-bottom: 1px; }
.seg { border-radius: 1px; transition: background 0.3s; }
.seg.empty { background: rgba(255,255,255,0.05); }

.u-reset {
  font-size: 8px;
  font-family: 'Space Mono', monospace;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* === Usage Card Separators & Org === */
.u-sep { height: 0.5px; background: var(--bd); margin: 8px 0; }
.u-org { font-size: 10px; font-weight: 500; color: var(--t2); margin-bottom: 1px; }
.u-org-plan { font-size: 8px; color: var(--t3); font-family: 'Space Mono', monospace; margin-bottom: 6px; }

/* === Usage Card Footer === */
.u-foot {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 0.5px solid var(--bd);
}
.u-refresh {
  font-size: 9px;
  font-family: 'Space Mono', monospace;
  color: var(--t2);
  padding: 2px 7px;
  border: 0.5px solid var(--bd);
  border-radius: 3px;
  cursor: pointer;
  background: transparent;
  transition: all 0.15s;
}
.u-refresh:hover { background: rgba(255,255,255,0.06); color: var(--t1); }
.u-refresh:disabled { opacity: 0.5; cursor: not-allowed; }
.u-ago { font-size: 8px; color: var(--t3); font-family: 'Space Mono', monospace; }

/* === Right Column === */
.right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0;
  overflow-y: auto;
}
.right-col::-webkit-scrollbar { width: 3px; }
.right-col::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

/* === Speed Dial === */
.dial-section { flex-shrink: 0; }
.dial-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.dial-item {
  background: var(--card);
  border: 0.5px solid var(--bd);
  border-radius: 10px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
}
.dial-item:hover { background: var(--card-h); transform: translateY(-2px); }
.dial-ico {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}
.dial-lbl {
  font-size: 10px;
  color: var(--t2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.dial-add { border: 1px dashed rgba(255,255,255,0.08); background: transparent; }
.dial-add .dial-ico { background: rgba(255,255,255,0.04); color: var(--t3); font-size: 16px; font-weight: 300; }

/* === Todo === */
.todo-section { display: flex; flex-direction: column; flex: 1; min-height: 0; max-width: 420px; }
.todo-cnt { font-size: 10px; color: var(--t3); font-family: 'Space Mono', monospace; margin-bottom: 6px; }
.todo-inp-row { display: flex; gap: 4px; margin-bottom: 8px; flex-shrink: 0; }
.todo-inp {
  flex: 1;
  background: var(--inp);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 7px 10px;
  font-size: 11px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  outline: none;
  min-width: 0;
}
.todo-inp:focus { border-color: rgba(255,255,255,0.15); }
.todo-inp::placeholder { color: var(--t3); }
.pri-btns { display: flex; gap: 2px; flex-shrink: 0; }
.pri-btn {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  font-size: 7px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pri-btn.sel { outline: 1.5px solid rgba(255,255,255,0.25); outline-offset: 1px; }
.pb-h { background: rgba(226,92,92,0.15); color: var(--danger); }
.pb-m { background: rgba(232,163,60,0.12); color: var(--warn); }
.pb-l { background: rgba(91,155,213,0.12); color: var(--blue); }
.todo-add {
  background: rgba(255,255,255,0.06);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 0 10px;
  font-size: 11px;
  color: var(--t2);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  height: 28px;
  flex-shrink: 0;
}
.todo-add:hover { background: rgba(255,255,255,0.1); color: var(--t1); }

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  flex: 1;
  padding-right: 2px;
}
.todo-list::-webkit-scrollbar { width: 3px; }
.todo-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.todo-item:hover { background: rgba(255,255,255,0.03); }
.t-chk {
  width: 13px;
  height: 13px;
  border: 1.5px solid var(--t3);
  border-radius: 3px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-top: 1px;
}
.t-chk:hover { border-color: var(--t2); }
.t-chk.dn { background: var(--gpt); border-color: var(--gpt); }
.t-chk.dn::after {
  content: '';
  display: block;
  width: 5px;
  height: 3px;
  border-left: 1.5px solid #0c0f14;
  border-bottom: 1.5px solid #0c0f14;
  transform: rotate(-45deg) translateY(-0.5px);
}
.t-txt { font-size: 11px; color: var(--t1); flex: 1; line-height: 1.4; }
.t-txt.dn { color: var(--t3); text-decoration: line-through; }
.t-pri {
  font-size: 7px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 2px;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  margin-top: 2px;
}
.tp-h { background: rgba(226,92,92,0.12); color: var(--danger); }
.tp-m { background: rgba(232,163,60,0.1); color: var(--warn); }
.tp-l { background: rgba(91,155,213,0.1); color: var(--blue); }
.t-del {
  opacity: 0;
  font-size: 12px;
  color: var(--t3);
  cursor: pointer;
  transition: all 0.15s;
  padding: 1px;
  flex-shrink: 0;
  background: none;
  border: none;
}
.todo-item:hover .t-del { opacity: 1; }
.t-del:hover { color: var(--danger); }

/* === Modal (shared for BookmarkModal) === */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
}
.modal-card {
  background: var(--bg);
  border: 0.5px solid var(--bd);
  border-radius: var(--r);
  padding: 24px;
  width: 320px;
}
.modal-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--t1);
  margin-bottom: 16px;
}
.modal-label {
  display: block;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--t3);
  margin-bottom: 4px;
}
.modal-input {
  width: 100%;
  background: var(--inp);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 7px 10px;
  font-size: 11px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  outline: none;
}
.modal-input:focus { border-color: rgba(255,255,255,0.15); }
.modal-input.error { border-color: var(--danger); }
.modal-error { font-size: 9px; color: var(--danger); margin-top: 2px; }
.modal-btn {
  font-size: 10px;
  font-family: 'DM Sans', sans-serif;
  padding: 5px 14px;
  border-radius: var(--rs);
  border: 0.5px solid var(--bd);
  cursor: pointer;
  transition: all 0.15s;
  background: transparent;
  color: var(--t2);
}
.modal-btn:hover { background: rgba(255,255,255,0.06); color: var(--t1); }
.modal-btn-primary { background: rgba(255,255,255,0.06); color: var(--t1); }

/* === Context Menu === */
.ctx-menu {
  position: fixed;
  z-index: 50;
  background: var(--bg);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 4px 0;
  min-width: 120px;
}
.ctx-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 12px;
  font-size: 10px;
  font-family: 'DM Sans', sans-serif;
  color: var(--t2);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.ctx-menu button:hover { background: rgba(255,255,255,0.04); }
.ctx-menu button.danger { color: var(--danger); }

/* === Collapse Toggle === */
.collapse-btn {
  font-size: 10px;
  color: var(--t3);
  line-height: 1;
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  transition: color 0.15s;
}
.collapse-btn:hover { color: var(--t2); }
```

- [ ] **Step 3: Update constants.ts**

Edit `core/constants.ts` to update provider colors, quota thresholds, and add the todos storage key:

```ts
export const REFRESH_INTERVAL_MINUTES = 5;
export const ALARM_NAME = 'refresh-usage';

export const QUOTA_THRESHOLDS = {
  low: 0.4,
  high: 0.75,
} as const;

export const PROVIDERS = {
  claude: {
    id: 'claude',
    name: 'Claude',
    color: '#d4845a',
    baseUrl: 'https://claude.ai',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#6bc88f',
    baseUrl: 'https://chatgpt.com',
  },
} as const;

export const STORAGE_KEYS = {
  usageData: 'usageData',
  lastUpdated: 'lastUpdated',
  bookmarks: 'bookmarks',
  collapsedProviders: 'collapsedProviders',
  todos: 'todos',
} as const;

export const DEFAULT_BOOKMARKS = [
  { id: 'default-1', name: 'Claude', url: 'https://claude.ai', order: 0 },
  { id: 'default-2', name: 'ChatGPT', url: 'https://chatgpt.com', order: 1 },
  { id: 'default-3', name: 'Google', url: 'https://www.google.com', order: 2 },
  { id: 'default-4', name: 'Gemini', url: 'https://gemini.google.com', order: 3 },
  { id: 'default-5', name: 'GitHub', url: 'https://github.com', order: 4 },
  { id: 'default-6', name: 'X', url: 'https://x.com', order: 5 },
] as const;
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm compile`
Expected: Compilation errors for components still referencing old pixel-theme classes. This is expected — they'll be fixed in subsequent tasks.

- [ ] **Step 5: Commit**

```bash
git add entrypoints/newtab/index.html entrypoints/newtab/style.css core/constants.ts
git commit -m "feat: replace pixel theme with minimal dark design system"
```

---

### Task 2: Types — Add TodoItem, Remove Old Layout Helper

**Files:**
- Edit: `core/types.ts`
- Remove: `components/provider-card-layout.ts`
- Remove: `tests/provider-card-layout.test.ts`

- [ ] **Step 1: Add TodoItem interface to types.ts**

Add to the end of `core/types.ts`, after the `Bookmark` interface:

```ts
export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  priority: 'high' | 'med' | 'low';
  createdAt: number;
}
```

- [ ] **Step 2: Remove provider-card-layout.ts and its test**

```bash
rm components/provider-card-layout.ts tests/provider-card-layout.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add core/types.ts
git rm components/provider-card-layout.ts tests/provider-card-layout.test.ts
git commit -m "feat: add TodoItem type, remove provider-card-layout helper"
```

---

### Task 3: QuotaBar — 16-Segment Bar with Brand Color

**Files:**
- Rewrite: `components/QuotaBar.tsx`

- [ ] **Step 1: Rewrite QuotaBar.tsx**

Replace the entire contents of `components/QuotaBar.tsx`:

```tsx
import { QUOTA_THRESHOLDS } from '@/core/constants';

interface QuotaBarProps {
  used: number; // 0-1
  label: string;
  brandColor: string; // CSS value, e.g. "var(--claude)"
  tooltip?: string;
}

const TOTAL_SEGMENTS = 16;

// Returns the fill color for filled segments only.
// When used === 0, no segments are filled so this is not called.
function getSegmentFillColor(used: number, brandColor: string): string {
  if (used >= QUOTA_THRESHOLDS.high) return 'var(--danger)';
  if (used >= QUOTA_THRESHOLDS.low) return 'var(--warn)';
  return brandColor;
}

// Note: pct-ok always renders green (var(--gpt)) for the normal range,
// matching the prototype's behavior. The spec says "color-coded by same
// thresholds" which could imply brand-specific coloring, but the prototype
// is authoritative here — all providers use green for normal range.
function getPctClass(used: number): string {
  if (used === 0) return 'pct-lo';
  if (used < QUOTA_THRESHOLDS.low) return 'pct-ok';
  if (used < QUOTA_THRESHOLDS.high) return 'pct-w';
  return 'pct-d';
}

export function QuotaBar({ used, label, brandColor, tooltip }: QuotaBarProps) {
  const pct = Math.round(Math.min(Math.max(used, 0), 1) * 100);
  const filled = Math.round(used * TOTAL_SEGMENTS);
  const fillColor = getSegmentFillColor(used, brandColor);

  return (
    <div className="u-row">
      <div className="u-row-top">
        <span className="u-row-label">
          {label}
          {tooltip && (
            <span className="relative group cursor-help ml-1">
              <span
                className="inline-flex items-center justify-center w-3 h-3"
                style={{ fontSize: '8px', border: '1px solid var(--t3)', borderRadius: '2px', color: 'var(--t3)' }}
              >
                ?
              </span>
              <span
                className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-64 px-2 py-1.5 text-xs leading-normal z-10"
                style={{ background: 'var(--bg)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rs)', color: 'var(--t2)', fontSize: '9px' }}
              >
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span className={`u-row-pct ${getPctClass(used)}`}>{pct}%</span>
      </div>
      <div className="seg-bar">
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={`seg ${i < filled ? '' : 'empty'}`}
            style={i < filled ? { background: fillColor, flex: 1 } : { flex: 1 }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/QuotaBar.tsx
git commit -m "feat: rewrite QuotaBar as 16-segment bar with brand color"
```

---

### Task 4: ResetCountdown — Restyle

**Files:**
- Edit: `components/ResetCountdown.tsx`

- [ ] **Step 1: Update ResetCountdown styling**

Replace the return statement's JSX in `components/ResetCountdown.tsx`. Change from `data-font` class and `pixel-reset-text` color to the new `u-reset` class:

```tsx
import { useEffect, useState } from 'react';

interface ResetCountdownProps {
  resetAt: string;
}

function formatCountdown(resetAt: string): string {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return 'Resetting...';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function ResetCountdown({ resetAt }: ResetCountdownProps) {
  const [text, setText] = useState(() => formatCountdown(resetAt));

  useEffect(() => {
    setText(formatCountdown(resetAt));
    const timer = setInterval(() => {
      setText(formatCountdown(resetAt));
    }, 60_000);
    return () => clearInterval(timer);
  }, [resetAt]);

  return <div className="u-reset">Reset: {text}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ResetCountdown.tsx
git commit -m "feat: restyle ResetCountdown to new design"
```

---

### Task 5: ProviderCard — New Card Design

**Files:**
- Rewrite: `components/ProviderCard.tsx`

- [ ] **Step 1: Rewrite ProviderCard.tsx**

Replace the entire contents of `components/ProviderCard.tsx`. Key changes: remove `pixel-border`/`pixel-btn`/`pixel-font` classes, use `u-card`/`u-head`/`u-dot`/`u-brand`/`u-plan`/`u-foot`/`u-refresh`/`u-ago` classes, remove import of `provider-card-layout`, pass `brandColor` to `QuotaBar`, always render both providers (no conditional on `hasAnyData` — that's handled in App.tsx):

```tsx
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { updateCollapsedProvidersMap } from '@/core/bookmark-utils';
import type { UsageData } from '@/core/types';
import { STORAGE_KEYS } from '@/core/constants';
import { QuotaBar } from './QuotaBar';
import { ResetCountdown } from './ResetCountdown';

function formatRelativeTime(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface ProviderCardProps {
  providerName: string;
  providerId: string;
  usageDataList: UsageData[];
  loginUrl?: string;
  color?: string;
  lastUpdated?: number;
}

function OrgCard({ data, loginUrl, brandColor, showPlan = true }: { data: UsageData; loginUrl?: string; brandColor: string; showPlan?: boolean }) {
  if (data.authStatus.status !== 'authenticated') {
    const url = loginUrl ?? '#';
    return (
      <div style={{ fontSize: '10px', color: 'var(--t3)', fontStyle: 'italic' }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t2)', textDecoration: 'none' }}>
          {data.authStatus.status === 'expired' ? 'Session expired — re-login →' : 'Login to see usage →'}
        </a>
      </div>
    );
  }

  const sections: ReactNode[] = [];

  if (data.plan && showPlan) {
    sections.push(
      <span key="plan" className="u-plan">{data.plan}</span>
    );
  }
  if (data.warning) {
    sections.push(
      <div key="warning" style={{ fontSize: '10px', color: 'var(--danger)' }}>{data.warning}</div>
    );
  }
  if (data.session) {
    sections.push(
      <div key="session">
        <QuotaBar used={data.session.used} label={data.session.label ?? 'Session'} brandColor={brandColor} />
        {data.session.resetAt && <ResetCountdown resetAt={data.session.resetAt} />}
      </div>
    );
  }
  if (data.weekly) {
    sections.push(
      <div key="weekly">
        <QuotaBar used={data.weekly.used} label={data.weekly.label ?? 'Weekly'} brandColor={brandColor} />
        {data.weekly.resetAt && <ResetCountdown resetAt={data.weekly.resetAt} />}
      </div>
    );
  }
  if (data.daily) {
    sections.push(
      <div key="daily">
        <QuotaBar used={data.daily.used} label={data.daily.label ?? 'Daily'} brandColor={brandColor} />
        {data.daily.resetAt && <ResetCountdown resetAt={data.daily.resetAt} />}
      </div>
    );
  }
  if (data.models) {
    for (const m of data.models) {
      sections.push(
        <div key={m.model}>
          <QuotaBar used={m.used} label={m.model} brandColor={brandColor} tooltip={m.tooltip} />
          {m.resetAt && <ResetCountdown resetAt={m.resetAt} />}
        </div>
      );
    }
  }
  if (data.extra) {
    sections.push(
      <div key="extra" style={{ fontSize: '9px', fontFamily: "'Space Mono', monospace", color: 'var(--t3)' }}>
        Extra: ${data.extra.spent.toFixed(2)} / ${data.extra.limit.toFixed(2)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {sections}
    </div>
  );
}

function getHighestUsage(dataList: UsageData[]): string {
  let max = 0;
  for (const d of dataList) {
    if (d.session) max = Math.max(max, d.session.used);
    if (d.weekly) max = Math.max(max, d.weekly.used);
    if (d.daily) max = Math.max(max, d.daily.used);
    if (d.models) {
      for (const m of d.models) max = Math.max(max, m.used);
    }
  }
  return `${Math.round(max * 100)}%`;
}

export function ProviderCard({
  providerName,
  providerId,
  usageDataList,
  loginUrl,
  color,
  lastUpdated,
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;
  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const collapsedRef = useRef(false);
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve());
  const brandColor = color ? `var(--${providerId === 'claude' ? 'claude' : 'gpt'})` : 'var(--t2)';

  useEffect(() => {
    let active = true;

    browser.storage.local
      .get(STORAGE_KEYS.collapsedProviders)
      .then((result: Record<string, unknown>) => {
        if (!active) return;
        const map = (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
        const storedCollapsed = Boolean(map[providerName]);
        collapsedRef.current = storedCollapsed;
        setCollapsed(storedCollapsed);
      });

    return () => { active = false; };
  }, [providerName]);

  const persistCollapsedState = useCallback(
    (next: boolean) => {
      persistQueueRef.current = persistQueueRef.current
        .then(async () => {
          const result = await browser.storage.local.get(STORAGE_KEYS.collapsedProviders);
          const map = (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
          await browser.storage.local.set({
            [STORAGE_KEYS.collapsedProviders]: updateCollapsedProvidersMap(map, providerName, next),
          });
        })
        .catch((error: unknown) => {
          console.error('Failed to persist collapsed provider state', error);
        });

      return persistQueueRef.current;
    },
    [providerName],
  );

  const toggleCollapse = () => {
    const next = !collapsedRef.current;
    collapsedRef.current = next;
    setCollapsed(next);
    void persistCollapsedState(next);
    if (!next) {
      void browser.runtime.sendMessage({ type: 'REFRESH_PROVIDER', providerId });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        browser.runtime.sendMessage({ type: 'REFRESH_PROVIDER', providerId }),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="u-card">
      <div className="u-head" style={{ marginBottom: collapsed ? 0 : '8px' }}>
        <div className="u-dot" style={{ background: color }} />
        <div className="u-brand">{providerName}</div>
        {collapsed && (
          <span className="u-ago">Peak: {getHighestUsage(usageDataList)}</span>
        )}
        <button className="collapse-btn" onClick={toggleCollapse}>
          {collapsed ? '▶' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <>
          {isSingleOrg ? (
            <OrgCard data={usageDataList[0]} loginUrl={loginUrl} brandColor={brandColor} />
          ) : (
            <div>
              {usageDataList.map((data, i) => (
                <div key={data.orgId}>
                  {i > 0 && <div className="u-sep" />}
                  <div className="u-org">{data.orgName}</div>
                  {data.plan && <div className="u-org-plan">Plan: {data.plan}</div>}
                  <OrgCard data={data} loginUrl={loginUrl} brandColor={brandColor} showPlan={false} />
                </div>
              ))}
            </div>
          )}

          <div className="u-foot">
            <button className="u-refresh" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? '...' : 'Refresh'}
            </button>
            {lastUpdated != null && lastUpdated > 0 && (
              <span className="u-ago">{formatRelativeTime(lastUpdated)}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm compile`
Expected: May still have errors from App.tsx or BookmarkGrid.tsx — that's OK at this stage.

- [ ] **Step 3: Commit**

```bash
git add components/ProviderCard.tsx
git commit -m "feat: restyle ProviderCard to new minimal card design"
```

---

### Task 6: BookmarkModal — Restyle

**Files:**
- Rewrite: `components/BookmarkModal.tsx`

- [ ] **Step 1: Rewrite BookmarkModal.tsx**

Replace the entire contents to use new modal classes:

```tsx
import { useState } from 'react';
import { validateBookmarkForm } from '@/core/bookmark-utils';
import type { Bookmark } from '@/core/types';

interface BookmarkModalProps {
  bookmark: Bookmark | null;
  onSave: (name: string, url: string) => void;
  onClose: () => void;
}

export function BookmarkModal({ bookmark, onSave, onClose }: BookmarkModalProps) {
  const [name, setName] = useState(bookmark?.name ?? '');
  const [url, setUrl] = useState(bookmark?.url ?? '');
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const handleSubmit = () => {
    const newErrors = validateBookmarkForm(name, url);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(name.trim(), url.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
        </div>

        <div className="mb-3">
          <label className="modal-label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            className={`modal-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. GitHub"
          />
          {errors.name && <div className="modal-error">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="modal-label">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            className={`modal-input ${errors.url ? 'error' : ''}`}
            placeholder="https://..."
          />
          {errors.url && <div className="modal-error">{errors.url}</div>}
        </div>

        <div className="flex gap-2 justify-end">
          <button className="modal-btn" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
            {bookmark ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BookmarkModal.tsx
git commit -m "feat: restyle BookmarkModal to new minimal design"
```

---

### Task 7: BookmarkGrid — Speed Dial Redesign

**Files:**
- Rewrite: `components/BookmarkGrid.tsx`

- [ ] **Step 1: Rewrite BookmarkGrid.tsx**

Replace the entire contents of `components/BookmarkGrid.tsx`. Key changes: vertical card layout in a 6-column grid, favicon with colored background, new context menu and delete confirmation styling:

```tsx
import { useState, useEffect, useRef } from 'react';
import { shouldCloseBookmarkContextMenu, deriveBookmarkLetter } from '@/core/bookmark-utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkModal } from './BookmarkModal';
import type { Bookmark } from '@/core/types';

const FALLBACK_COLORS = [
  { bg: 'rgba(212,132,90,0.15)', fg: 'var(--claude)' },
  { bg: 'rgba(107,200,143,0.12)', fg: 'var(--gpt)' },
  { bg: 'rgba(91,155,213,0.12)', fg: 'var(--blue)' },
  { bg: 'rgba(226,92,92,0.12)', fg: 'var(--danger)' },
  { bg: 'rgba(232,163,60,0.12)', fg: 'var(--warn)' },
  { bg: 'rgba(140,120,200,0.12)', fg: '#a08cdc' },
];

function getBookmarkColor(bookmark: Bookmark, index: number) {
  if (bookmark.color) {
    return { bg: `${bookmark.color}20`, fg: bookmark.color };
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function getFaviconUrl(bookmarkUrl: string): string | null {
  try {
    const { hostname } = new URL(bookmarkUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function BookmarkIcon({ bookmark, index }: { bookmark: Bookmark; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const faviconUrl = getFaviconUrl(bookmark.url);
  const fallbackLetter = deriveBookmarkLetter(bookmark.name, bookmark.letter);
  const colors = getBookmarkColor(bookmark, index);

  return (
    <div
      className="dial-ico"
      style={{ background: colors.bg, color: colors.fg }}
    >
      {faviconUrl && !imgFailed ? (
        <img
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          onError={() => setImgFailed(true)}
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        fallbackLetter
      )}
    </div>
  );
}

interface ContextMenuState {
  bookmark: Bookmark;
  x: number;
  y: number;
}

export function BookmarkGrid() {
  const { bookmarks, addBookmark, editBookmark, deleteBookmark } = useBookmarks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Bookmark | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shouldCloseBookmarkContextMenu(menuRef.current, event.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    setContextMenu({ bookmark, x: e.clientX, y: e.clientY });
  };

  const handleEdit = (bookmark: Bookmark) => {
    setContextMenu(null);
    setEditingBookmark(bookmark);
    setModalOpen(true);
  };

  const handleDeleteRequest = (bookmark: Bookmark) => {
    setContextMenu(null);
    setConfirmDelete(bookmark);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteBookmark(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleSave = (name: string, url: string) => {
    if (editingBookmark) {
      editBookmark(editingBookmark.id, { name, url });
    } else {
      addBookmark(name, url);
    }
    setModalOpen(false);
    setEditingBookmark(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBookmark(null);
  };

  return (
    <div className="dial-section">
      <div className="slabel">Speed dial</div>
      <div className="dial-grid">
        {bookmarks.map((bookmark, i) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            className="dial-item"
            onContextMenu={(e) => handleContextMenu(e, bookmark)}
          >
            <BookmarkIcon bookmark={bookmark} index={i} />
            <div className="dial-lbl">{bookmark.name}</div>
          </a>
        ))}

        <button
          className="dial-item dial-add"
          onClick={() => { setEditingBookmark(null); setModalOpen(true); }}
        >
          <div className="dial-ico">+</div>
          <div className="dial-lbl">Add</div>
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="ctx-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => handleEdit(contextMenu.bookmark)}>Edit</button>
          <button className="danger" onClick={() => handleDeleteRequest(contextMenu.bookmark)}>Delete</button>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete "{confirmDelete.name}"?</div>
            <div className="flex gap-2 justify-end">
              <button className="modal-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="modal-btn" style={{ color: 'var(--danger)' }} onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <BookmarkModal
          bookmark={editingBookmark}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/BookmarkGrid.tsx
git commit -m "feat: redesign BookmarkGrid as Speed Dial 6-column grid"
```

---

### Task 8: useTodos Hook — CRUD + Midnight Auto-Clear

**Files:**
- Create: `hooks/useTodos.ts`

- [ ] **Step 1: Create useTodos.ts**

Create `hooks/useTodos.ts` mirroring the `useBookmarks` pattern:

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/core/constants';
import type { TodoItem } from '@/core/types';

function getStartOfToday(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function clearCompletedBeforeToday(todos: TodoItem[]): TodoItem[] {
  const startOfToday = getStartOfToday();
  return todos.filter((t) => !t.done || t.createdAt >= startOfToday);
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const todosRef = useRef<TodoItem[]>([]);

  useEffect(() => {
    browser.storage.local
      .get(STORAGE_KEYS.todos)
      .then((result: Record<string, unknown>) => {
        const stored = (result[STORAGE_KEYS.todos] ?? []) as TodoItem[];
        const cleaned = clearCompletedBeforeToday(stored);

        // Persist if we cleaned anything
        if (cleaned.length !== stored.length) {
          browser.storage.local.set({ [STORAGE_KEYS.todos]: cleaned });
        }

        todosRef.current = cleaned;
        setTodos(cleaned);
      });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.todos]?.newValue) {
        const updated = changes[STORAGE_KEYS.todos].newValue as TodoItem[];
        todosRef.current = updated;
        setTodos(updated);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const persist = useCallback((updated: TodoItem[]) => {
    browser.storage.local.set({ [STORAGE_KEYS.todos]: updated });
  }, []);

  const applyTodos = useCallback(
    (updater: (current: TodoItem[]) => TodoItem[]) => {
      const updated = updater(todosRef.current);
      todosRef.current = updated;
      setTodos(updated);
      persist(updated);
    },
    [persist],
  );

  const addTodo = useCallback(
    (text: string, priority: TodoItem['priority']) => {
      applyTodos((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          text,
          done: false,
          priority,
          createdAt: Date.now(),
        },
      ]);
    },
    [applyTodos],
  );

  const toggleTodo = useCallback(
    (id: string) => {
      applyTodos((current) =>
        current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      );
    },
    [applyTodos],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      applyTodos((current) => current.filter((t) => t.id !== id));
    },
    [applyTodos],
  );

  // Sort: incomplete first, completed last
  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done));

  return { todos: sorted, addTodo, toggleTodo, deleteTodo };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useTodos.ts
git commit -m "feat: add useTodos hook with persistence and midnight auto-clear"
```

---

### Task 9: TodoList Component

**Files:**
- Create: `components/TodoList.tsx`

- [ ] **Step 1: Create TodoList.tsx**

Create `components/TodoList.tsx`:

```tsx
import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import type { TodoItem } from '@/core/types';

const PRIORITY_LABELS: Record<TodoItem['priority'], string> = {
  high: 'HIGH',
  med: 'MED',
  low: 'LOW',
};

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('high');

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTodo(text, priority);
    setInput('');
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="todo-section">
      <div className="slabel">Today's focus</div>
      <div className="todo-cnt">{doneCount} / {todos.length} done</div>

      <div className="todo-inp-row">
        <input
          className="todo-inp"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="Add a task..."
        />
        <div className="pri-btns">
          <button
            className={`pri-btn pb-h ${priority === 'high' ? 'sel' : ''}`}
            onClick={() => setPriority('high')}
          >
            H
          </button>
          <button
            className={`pri-btn pb-m ${priority === 'med' ? 'sel' : ''}`}
            onClick={() => setPriority('med')}
          >
            M
          </button>
          <button
            className={`pri-btn pb-l ${priority === 'low' ? 'sel' : ''}`}
            onClick={() => setPriority('low')}
          >
            L
          </button>
        </div>
        <button className="todo-add" onClick={handleAdd}>Add</button>
      </div>

      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <div
              className={`t-chk ${todo.done ? 'dn' : ''}`}
              role="checkbox"
              aria-checked={todo.done}
              tabIndex={0}
              onClick={() => toggleTodo(todo.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTodo(todo.id); } }}
            />
            <span className={`t-txt ${todo.done ? 'dn' : ''}`}>{todo.text}</span>
            <span className={`t-pri tp-${todo.priority[0]}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            <button className="t-del" onClick={() => deleteTodo(todo.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TodoList.tsx
git commit -m "feat: add TodoList component with priority and counter"
```

---

### Task 10: App.tsx — New Layout with Greeting + Two-Column Grid

**Files:**
- Rewrite: `entrypoints/newtab/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

Replace the entire contents of `entrypoints/newtab/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
import { BookmarkGrid } from '@/components/BookmarkGrid';
import { TodoList } from '@/components/TodoList';
import { PROVIDERS } from '@/core/constants';

function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(date: Date): string {
  return (
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
    '  \u00b7  ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

function Greeting() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="greeting">
      <div className="time">{formatTime(now)}</div>
      <h1>
        {getGreeting()}, <span>ready to build?</span>
      </h1>
    </div>
  );
}

function EmptyProviderCard({ providerName, loginUrl, color }: { providerName: string; loginUrl: string; color: string }) {
  return (
    <div className="u-card">
      <div className="u-head">
        <div className="u-dot" style={{ background: color }} />
        <div className="u-brand">{providerName}</div>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--t3)', fontStyle: 'italic' }}>
        <a href={loginUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t2)', textDecoration: 'none' }}>
          Login to see usage →
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const { data, lastUpdated } = useUsageData();

  const claudeData = data.filter((d) => d.provider === PROVIDERS.claude.id);
  const chatgptData = data.filter((d) => d.provider === PROVIDERS.chatgpt.id);

  return (
    <>
      <Greeting />

      <div className="main">
        {/* Left: Usage Column */}
        <div className="usage-col">
          <div className="slabel">AI usage</div>

          {claudeData.length > 0 ? (
            <ProviderCard
              providerName={PROVIDERS.claude.name}
              providerId={PROVIDERS.claude.id}
              usageDataList={claudeData}
              loginUrl={PROVIDERS.claude.baseUrl}
              color={PROVIDERS.claude.color}
              lastUpdated={lastUpdated}
            />
          ) : (
            <EmptyProviderCard
              providerName={PROVIDERS.claude.name}
              loginUrl={PROVIDERS.claude.baseUrl}
              color={PROVIDERS.claude.color}
            />
          )}

          {chatgptData.length > 0 ? (
            <ProviderCard
              providerName={PROVIDERS.chatgpt.name}
              providerId={PROVIDERS.chatgpt.id}
              usageDataList={chatgptData}
              loginUrl={PROVIDERS.chatgpt.baseUrl}
              color={PROVIDERS.chatgpt.color}
              lastUpdated={lastUpdated}
            />
          ) : (
            <EmptyProviderCard
              providerName={PROVIDERS.chatgpt.name}
              loginUrl={PROVIDERS.chatgpt.baseUrl}
              color={PROVIDERS.chatgpt.color}
            />
          )}
        </div>

        {/* Right: Speed Dial + Todo */}
        <div className="right-col">
          <BookmarkGrid />
          <TodoList />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify full TypeScript compilation**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm compile`
Expected: PASS — all files now reference new design tokens and classes.

- [ ] **Step 3: Verify dev build**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm build`
Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add entrypoints/newtab/App.tsx
git commit -m "feat: rewrite App.tsx with greeting, two-column layout, and todo"
```

---

### Task 11: Verify and Fix

- [ ] **Step 1: Run existing tests**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm test 2>/dev/null || node --import ./tests/register-aliases.mjs --test tests/bookmark-utils.test.ts tests/claude-probe.test.ts`
Expected: All existing tests pass (we didn't change any tested logic).

- [ ] **Step 2: Manual visual check**

Run: `cd /Users/wqq/Code/Personal/ai-pulse-tab && pnpm dev`
Open the extension's new tab page in Chrome and verify:
- Greeting shows correct time and hour-based greeting
- Two-column layout: usage cards left, speed dial + todo right
- Usage cards use segment bars with correct colors
- Speed Dial shows 6-column grid with icons
- Todo: can add, toggle, delete tasks with priority
- Right-click on bookmarks shows context menu
- Add bookmark modal works

- [ ] **Step 3: Fix any visual issues found**

Address any discrepancies with the prototype. Compare against `docs/newtab-prototype.html` opened in a browser.

- [ ] **Step 4: Final commit if fixes were made**

```bash
git add -A
git commit -m "fix: address visual issues from manual review"
```
