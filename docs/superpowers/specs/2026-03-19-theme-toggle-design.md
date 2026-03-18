# Light/Dark Theme Toggle

**Date:** 2026-03-19
**Status:** Approved

## Overview

Add a three-mode theme toggle (dark / light / system) to the new tab page. Uses CSS variable overrides via `data-theme` attribute on `<html>`. Persisted in `chrome.storage.local`. Includes a flash-prevention external script loaded before React.

## Section 1: Light Theme Color Palette

Dark theme (existing `:root`) remains the default. Light theme applied via `[data-theme="light"]` selector:

| Variable | Dark Value | Light Value | Purpose |
|----------|-----------|-------------|---------|
| `--bg` | `#0c0f14` | `#ffffff` | Page background |
| `--card` | `rgba(255,255,255,0.04)` | `#fafafa` | Card background |
| `--card-h` | `rgba(255,255,255,0.065)` | `#f0f0f0` | Card hover |
| `--inp` | `rgba(255,255,255,0.06)` | `#f5f5f5` | Input background |
| `--t1` | `#e8e6e1` | `#111111` | Primary text |
| `--t2` | `#8a877f` | `#999999` | Secondary text |
| `--t3` | `#5c5a54` | `#bbbbbb` | Tertiary text |
| `--bd` | `rgba(255,255,255,0.06)` | `#eeeeee` | Borders |

**Unchanged across themes:** `--claude`, `--gpt`, `--warn`, `--danger`, `--blue`, `--r`, `--rs` — brand/functional colors stay consistent for recognition.

### Additional light-mode overrides

Some component styles use hardcoded `rgba(255,255,255,...)` values (e.g., scrollbar thumbs, segment bar empties, todo hover, priority button backgrounds). These need light-mode specific overrides since white-on-white is invisible:

- `.seg.empty` background: `rgba(0,0,0,0.06)` (was `rgba(255,255,255,0.05)`)
- `.usage-col::-webkit-scrollbar-thumb`, `.right-col::-webkit-scrollbar-thumb`, `.todo-list::-webkit-scrollbar-thumb`: `rgba(0,0,0,0.12)` (was `rgba(255,255,255,0.1)`)
- `.todo-item:hover` background: `rgba(0,0,0,0.03)` (was `rgba(255,255,255,0.03)`)
- `.dial-add` border: `1px dashed rgba(0,0,0,0.12)` (was `rgba(255,255,255,0.08)`)
- `.dial-add .dial-ico` background: `rgba(0,0,0,0.04)` (was `rgba(255,255,255,0.04)`)
- `.pri-btn.sel` outline: `1.5px solid rgba(0,0,0,0.2)` (was `rgba(255,255,255,0.25)`)
- `.todo-inp:focus` border-color: `rgba(0,0,0,0.15)` (was `rgba(255,255,255,0.15)`)
- `.modal-input:focus` border-color: `rgba(0,0,0,0.15)` (was `rgba(255,255,255,0.15)`)
- `.u-refresh:hover` background: `rgba(0,0,0,0.04)` (was `rgba(255,255,255,0.06)`)
- `.todo-add` background: `rgba(0,0,0,0.04)` (was `rgba(255,255,255,0.06)`)
- `.todo-add:hover` background: `rgba(0,0,0,0.06)` (was `rgba(255,255,255,0.1)`)
- `.ctx-menu button:hover` background: `rgba(0,0,0,0.04)` (was `rgba(255,255,255,0.04)`)
- `.modal-btn:hover` background: `rgba(0,0,0,0.04)` (was `rgba(255,255,255,0.06)`)
- `.modal-btn-primary` background: `rgba(0,0,0,0.08)` (was `rgba(255,255,255,0.06)`) — slightly stronger for contrast
- `.t-chk.dn::after` border-color: `#ffffff` (was `#0c0f14`) — checkmark contrasts with green background
- `.modal-overlay` background: `rgba(0,0,0,0.4)` (was `rgba(0,0,0,0.7)`) — lighter overlay in light mode

## Section 2: Theme Toggle Mechanism

### Storage

New key in `STORAGE_KEYS`: `theme: 'theme'`

Value: `'dark' | 'light' | 'system'`, default `'dark'`

### New Type (`core/types.ts`)

Add `export type Theme = 'dark' | 'light' | 'system';` for reuse by hook and component.

### Flash Prevention (external script — MV3 CSP compliant)

Chrome Manifest V3 prohibits inline `<script>` tags in extension pages (`script-src 'self'`). Instead, use an **external script file** loaded in `<head>` before React:

**New file: `entrypoints/newtab/theme-init.ts`** (WXT will bundle it)

Referenced in `index.html` as `<script src="./theme-init.js"></script>` before the React module script.

The script:
1. Sets `<html data-theme="dark">` as immediate default (via the HTML attribute)
2. Reads theme preference from `chrome.storage.local`
3. If `system`, checks `window.matchMedia('(prefers-color-scheme: light)').matches`
4. Sets `document.documentElement.dataset.theme` to the resolved value

Since `chrome.storage.local.get` is async, there may be a brief dark flash for light-mode users. To mitigate: the `<html>` tag starts with `data-theme="dark"` and the script resolves within a microtask before first paint in most cases.

### React Hook (`hooks/useTheme.ts`)

- Loads theme preference from `chrome.storage.local`
- Returns `{ theme, setTheme }` where `theme` is the stored preference (`'dark' | 'light' | 'system'`)
- `setTheme(value)`:
  1. Persists to `chrome.storage.local`
  2. Resolves the effective theme (if `system`, check `matchMedia`)
  3. Sets `document.documentElement.dataset.theme`
- Listens to `matchMedia` change events — when OS theme changes and user is on `system` mode, updates `data-theme` accordingly
- Listens to `storage.onChanged` for cross-tab sync

### CSS Structure

```css
:root { /* dark variables (default) */ }
[data-theme="light"] { /* light variable overrides + component overrides */ }
```

## Section 3: Toggle Button UI

### Position & Layout

Placed in the top-right via a flex wrapper around the greeting area. Not absolute-positioned — participates in document flow.

Add a wrapper in `App.tsx` around the greeting area:
```
<div style="display:flex; justify-content:space-between; align-items:flex-start">
  <Greeting />
  <ThemeToggle />
</div>
```

### Component (`components/ThemeToggle.tsx`)

- Renders a small icon button
- Click cycles: `dark → light → system → dark → ...`
- Uses `useTheme` hook
- Includes `aria-label` that updates with current mode (e.g., "Theme: dark, click to switch")

### Icons (text-based, no SVG dependencies)

| Mode | Icon | Meaning |
|------|------|---------|
| `dark` | `☾` | Moon — currently dark |
| `light` | `☀` | Sun — currently light |
| `system` | `◐` | Half circle — auto/system |

### Button Styling (new CSS class `.theme-toggle`)

- Size: 28x28px
- `border-radius: 6px`
- Background: `var(--card)`
- Border: `0.5px solid var(--bd)`
- Font size: 14px
- Color: `var(--t2)`
- Hover: background `var(--card-h)`
- Cursor: pointer
- Transition: all 0.15s
- `flex-shrink: 0`

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `entrypoints/newtab/style.css` | Edit | Add `[data-theme="light"]` overrides + `.theme-toggle` class |
| `entrypoints/newtab/index.html` | Edit | Add theme-init script reference in `<head>`, set `data-theme="dark"` on `<html>` |
| `entrypoints/newtab/theme-init.ts` | New | Flash-prevention script (reads storage, sets data-theme before React) |
| `entrypoints/newtab/App.tsx` | Edit | Add ThemeToggle to greeting area layout |
| `hooks/useTheme.ts` | New | Theme state management hook |
| `components/ThemeToggle.tsx` | New | Toggle button component |
| `core/types.ts` | Edit | Add `Theme` type |
| `core/constants.ts` | Edit | Add `theme` to `STORAGE_KEYS` |

## Files NOT Changed

- All probe files, background.ts, existing hooks, existing component logic
- Only UI layer + new hook/component
- Note: `BookmarkGrid.tsx` has a hardcoded `#a08cdc` purple in `FALLBACK_COLORS` — reviewed and acceptable in both themes (sufficient contrast on both dark and light card backgrounds)
