# Todo Kanban Board Design

## Overview

Upgrade the existing simple checklist-style TodoList to a Kanban board with three columns (PENDING / IN PROGRESS / DONE), supporting drag-and-drop via `@dnd-kit`, quick-move buttons, progress bar, task numbering, and manual cleanup.

## Layout

The overall page layout remains two-column:
- **Left column (340px)**: AI Usage cards (Claude, ChatGPT) — full height, unchanged
- **Right column (1fr)**: Speed Dial on top, Kanban TodoList below

The Kanban board replaces the original `TodoList` component in the right column, using the full available width for a three-column grid.

## Data Model

```typescript
interface TodoItem {
  id: string;                                    // crypto.randomUUID()
  number: number;                                // Auto-increment #1, #2, #3...
  text: string;                                  // Task description
  status: 'pending' | 'in-progress' | 'done';   // Replaces done: boolean
  priority: 'high' | 'med' | 'low';             // Unchanged
  order: number;                                 // Sort weight within column
  createdAt: number;                             // Timestamp in ms
}
```

### Changes from current model
- `done: boolean` replaced by `status: 'pending' | 'in-progress' | 'done'`
- Added `number`: global auto-increment, assigned on creation, never recycled on delete
- Added `order`: per-column sort weight, updated on drag reorder

### Number counter
A separate storage key `'todoNextNumber'` holds the next number to assign. On `addTodo`, the counter increments and persists.

## Component Architecture

```
TodoKanban/
├── TodoKanban.tsx        # Main: input row, progress bar, DndContext, three columns
├── KanbanColumn.tsx      # Column: header (title + count + clear button), SortableContext, card list
├── TodoCard.tsx          # Card: number, priority badge, text, quick-move buttons, delete, useSortable
└── index.ts              # Export
```

### TodoKanban.tsx
- Holds `useTodos()` state
- Wraps children in `DndContext` from `@dnd-kit/core`
- Handles `onDragEnd`: determines if cross-column move or intra-column reorder
- Renders input row (text input + H/M/L priority selector + Add button)
- Renders progress bar (completed / total)
- Renders three `KanbanColumn` components in a CSS grid

### KanbanColumn.tsx
- Props: `status`, `items[]`, `onMove`, `onDelete`, `onEdit`, `onClearAll?`
- Wraps card list in `SortableContext` from `@dnd-kit/sortable`
- Column header: title, item count badge, "Clear all" button (DONE column only)
- Column styling: colored top border (gray for PENDING, orange for IN PROGRESS, green for DONE)
- Background tint matching column status

### TodoCard.tsx
- Props: `todo`, `onMove`, `onDelete`, `onEdit`
- Uses `useSortable` from `@dnd-kit/sortable` for drag behavior
- Displays: `#number`, priority badge (HIGH/MED/LOW with color), task text
- Quick-move buttons (hover visible):
  - PENDING: only `→` (to IN PROGRESS)
  - IN PROGRESS: `←` (to PENDING) + `→` (to DONE)
  - DONE: only `←` (to IN PROGRESS)
- Button colors match target column
- Delete button `×` in top-right corner (hover visible)
- Double-click text to inline edit (not available when status is 'done')
- DONE cards: strikethrough text + reduced opacity (0.6)

### useTodos.ts (refactored)

Methods:
- `addTodo(text, priority)` — creates todo with status `'pending'`, assigns next number, order at end of PENDING column
- `moveTodo(id, targetStatus, targetOrder?)` — moves card to target column, updates status and order
- `reorderTodo(id, newOrder)` — updates order within same column
- `editTodo(id, text)` — updates task text
- `deleteTodo(id)` — removes todo
- `clearDone()` — removes all todos with status `'done'`

Removed:
- `toggleTodo` — replaced by `moveTodo`

Sorting: returns todos grouped by status, each group sorted by `order` ascending.

## Interaction Details

### Drag & Drop
- Cards can be dragged to any column, any position
- Drag overlay: card with shadow + slight opacity reduction
- Drop target: dashed border placeholder at insertion point
- Dragging to DONE column sets status to `'done'`
- Dragging from DONE to another column clears done state
- Supports intra-column reorder (drag up/down within same column)

### Quick-Move Buttons
- Appear on card hover
- Move to adjacent column only (one step at a time)
- Card moves to the end (bottom) of the target column
- Arrow direction: `→` moves right, `←` moves left
- Arrow color matches target column (orange for IN PROGRESS, green for DONE, gray for PENDING)

### Inline Edit
- Double-click task text to enter edit mode
- Enter or blur to save, Escape to cancel
- Empty text rejected (restores original)
- Not available on DONE cards

### Delete
- Per-card: `×` button appears on hover (top-right corner)
- Batch: "Clear all" button in DONE column header
- Both are immediate (no confirmation dialog)

## Progress Bar

- Located below the input row, above the Kanban columns
- Shows `completed / total` as text label (e.g., "2 / 5 done")
- Green fill bar (`#4caf50`) proportional to completion ratio
- Animates width changes with CSS transition

## Storage & Persistence

- Storage: `chrome.storage.local`, key `'todos'` (unchanged)
- New key: `'todoNextNumber'` for auto-increment counter
- Cross-tab sync: `storage.onChanged` listener (unchanged)
- All mutations immediately persist to storage

### Data Migration

On first load, if existing todos have `done` field but no `status` field:
1. `done: true` → `status: 'done'`
2. `done: false` → `status: 'pending'`
3. Assign `number` by `createdAt` order (1, 2, 3...)
4. Assign `order` by current array position
5. Set `todoNextNumber` to `max(number) + 1`
6. Write migrated data back to storage
7. Remove `done` field from each item

Migration runs once; subsequent loads skip it.

## Dependencies

New packages:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

## Styling

- All existing `.todo-*` CSS classes replaced with new kanban styles
- Dark theme colors follow existing design system (--bg, --t1, --t2, --t3, --danger, --warn, --blue, --gpt)
- Light theme support via `[data-theme="light"]` selector
- Column backgrounds: subtle tinted backgrounds matching status color
- Column top borders: 2px solid (gray / orange / green)
- Cards: `rgba(255,255,255,0.04)` background, 8px border-radius
- Hover state: slightly brighter background, border highlight

## Scope Exclusions

- No Nag Timer / countdown feature
- No midnight auto-clear (replaced by manual cleanup)
- No task due dates or time tracking
- No column collapse/expand
- No task labels or categories beyond priority
