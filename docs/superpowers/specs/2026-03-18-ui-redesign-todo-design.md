# UI Redesign + Todo List Feature

**Date:** 2026-03-18
**Status:** Approved
**Prototype reference:** `docs/newtab-prototype.html`

## Overview

Complete UI layer rewrite from pixel/retro theme to clean dark minimal aesthetic, plus new Todo list feature. All backend logic (probes, background service, types, data hooks) remains unchanged.

## Section 1: Design System

### Fonts
- `Press Start 2P` → `DM Sans` (body text, weights: 400, 500, 600)
- `JetBrains Mono` → `Space Mono` (data/numbers, weights: 400, 700)
- Update Google Fonts link in `entrypoints/newtab/index.html`

### Color Palette (CSS custom properties)
```css
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
```

### Removed
- All `pixel-border`, `pixel-btn`, `pixel-font` classes
- `quick-link-card` styles
- `providers-grid`, `dashboard-content` layout classes

### Constants Update
- `PROVIDERS.claude.color`: `#D97706` → `#d4845a`
- `PROVIDERS.chatgpt.color`: `#10A37F` → `#6bc88f`

## Section 2: Page Layout

### Structure
```
body (100vh, flex column, padding: 32px 40px, overflow: hidden)
├── Greeting (flex-shrink: 0, margin-bottom: 24px)
│   ├── Time line (Space Mono, 11px, uppercase, color: --t3)
│   └── h1 (DM Sans, 26px, "Good morning, <span>ready to build?</span>")
└── Main (grid: 340px 1fr, gap: 28px, flex: 1, min-height: 0)
    ├── Left: Usage Column (flex column, gap: 10px, overflow-y: auto)
    │   ├── Section label "AI USAGE"
    │   ├── Claude card
    │   └── ChatGPT card
    └── Right Column (flex column, gap: 24px, overflow-y: auto)
        ├── Speed Dial section (flex-shrink: 0)
        └── Todo section (flex: 1, min-height: 0)
```

### Greeting
- Time format: "WEDNESDAY, MARCH 18 · 10:30 AM"
- Greeting: hour-based (morning/afternoon/evening) + ", ready to build?"

### Section Labels
- Shared style: `font-size: 9px; font-weight: 600; letter-spacing: 1.6px; text-transform: uppercase; color: var(--t3)`
- Followed by a flex line divider (`::after` pseudo-element, 0.5px height, `var(--bd)`)

### Not-logged-in state
- Left column shows login prompt; right column still shows Speed Dial + Todo normally

## Section 3: Usage Cards (ProviderCard + QuotaBar)

### ProviderCard
- Card: `background: var(--card); border: 0.5px solid var(--bd); border-radius: var(--r); padding: 12px 14px`
- Header: brand dot (7px circle) + name (12px, 500) + optional plan badge (Space Mono 9px, bordered)
- Multi-org: separator line between orgs, org name (10px, --t2) + plan label (8px, --t3)
- Footer: Refresh button (Space Mono 9px, bordered pill) + "Xm ago" timestamp
- Collapse/expand: logic preserved, visual updated to new style

### QuotaBar (Segment Bar)
- 16 segments, height: 5px, border-radius: 1px, gap: 1.5px
- Color logic:
  - Normal → brand color (`filled-cl` for Claude, `filled-gp` for ChatGPT)
  - 50-75% → `--warn`
  - 75%+ → `--danger`
  - 0% → `rgba(255,255,255,0.12)`
- Label row: left label (10px, --t2), right percentage (Space Mono 10px, color-coded)
- Reset line: 8px, Space Mono, --t3, uppercase

### Preserved Logic
- ProviderCard props interface unchanged
- Collapse/expand + persistence unchanged
- Refresh message sending unchanged
- OrgCard section rendering logic (plan, warning, session, weekly, models, extra) unchanged
- ResetCountdown component preserved, only restyled

## Section 4: Speed Dial (BookmarkGrid Redesign)

### Layout
- Grid: `grid-template-columns: repeat(6, 1fr); gap: 10px`
- Card: vertical layout (icon above, name below), `border-radius: 10px; padding: 14px 8px`
- Icon: 30x30px, `border-radius: 8px`, colored semi-transparent background + letter/favicon
- Name: `10px, color: var(--t2)`, single-line truncation
- Add button: dashed border `1px dashed rgba(255,255,255,0.08)`, "+" icon
- Hover: `translateY(-2px)` + background brightened

### Preserved Logic
- `useBookmarks` hook unchanged
- Right-click context menu (edit/delete) preserved, styles updated
- `BookmarkModal` preserved, styles updated
- Favicon fetching logic unchanged
- Delete confirmation dialog preserved, styles updated

### Icon Color
- Uses `bookmark.color` field if present
- Auto-assigns color from name if absent (existing `Bookmark.color?: string` field)

## Section 5: Todo List (New Feature)

### New Type (`core/types.ts`)
```ts
export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  priority: 'high' | 'med' | 'low';
  createdAt: number; // timestamp
}
```

### New Storage Key (`core/constants.ts`)
```ts
STORAGE_KEYS.todos = 'todos'
```

### New Hook (`hooks/useTodos.ts`)
- Pattern: mirrors `useBookmarks` — load from `chrome.storage.local`, listen for changes, persist on mutation
- Methods: `addTodo(text, priority)`, `toggleTodo(id)`, `deleteTodo(id)`
- Midnight auto-clear: on load, remove completed todos where `createdAt` < start of today (local midnight)
- Executes once per new tab open

### New Component (`components/TodoList.tsx`)

**Input row:**
- Text input + priority buttons (H/M/L) + Add button
- Default priority: high
- Enter key submits

**List:**
- Sort: incomplete first, completed last
- Each item: checkbox + text + priority badge + delete button (visible on hover)
- Checkbox done state: green fill + checkmark
- Text done state: gray + strikethrough
- Priority colors: H=`--danger`, M=`--warn`, L=`--blue`

**Counter:** "X / Y done" (Space Mono, --t3)

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `entrypoints/newtab/index.html` | Edit | Update Google Fonts link |
| `entrypoints/newtab/style.css` | Rewrite | New design system, all new styles |
| `entrypoints/newtab/App.tsx` | Rewrite | New layout with greeting + two-column grid |
| `components/ProviderCard.tsx` | Edit | Restyle to new card design |
| `components/QuotaBar.tsx` | Edit | 16-segment bar replacing 10-block pixel grid |
| `components/ResetCountdown.tsx` | Edit | Restyle text |
| `components/BookmarkGrid.tsx` | Edit | Redesign as Speed Dial grid |
| `components/BookmarkModal.tsx` | Edit | Restyle modal to new design |
| `components/TodoList.tsx` | New | Todo list component |
| `hooks/useTodos.ts` | New | Todo state management hook |
| `core/types.ts` | Edit | Add `TodoItem` interface |
| `core/constants.ts` | Edit | Update colors, add `todos` storage key |

## Files NOT Changed

- `entrypoints/background.ts`
- `probes/claude-probe.ts`
- `probes/chatgpt-probe.ts`
- `hooks/useUsageData.ts`
- `hooks/useBookmarks.ts`
- `core/bookmark-utils.ts`
