# Todo Kanban Board Design

## Overview

Upgrade the existing simple checklist-style TodoList to a Kanban board with three columns (PENDING / IN PROGRESS / DONE), supporting drag-and-drop via `@dnd-kit`, quick-move buttons, progress bar, task numbering, and manual cleanup.

## Layout

The overall page layout remains two-column:
- **Left column (340px)**: AI Usage cards (Claude, ChatGPT) — full height, unchanged
- **Right column (1fr)**: Speed Dial on top, Kanban TodoList below

The Kanban board replaces the original `TodoList` component in the right column, using the full available width for a three-column grid. Remove the current `max-width: 420px` constraint on the todo section.

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
- Added `order`: integer sort weight within column. After every move or reorder, re-index all items in affected column(s) as 0, 1, 2, ... to keep values compact. When quick-moving a card to the end of a target column, assign `max(order) + 1` before re-index

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
- Handles `onDragEnd`: uses `over` item's position to compute insertion index via `arrayMove` from `@dnd-kit/sortable`. For cross-column moves, inserts before the hovered card; if dropped on empty column area, appends to end
- Handles `onDragCancel`: card returns to original position, no state change
- Sensors: `PointerSensor` with `activationConstraint: { distance: 5 }` (prevents conflict with double-click-to-edit), `KeyboardSensor` with `sortableKeyboardCoordinates`
- Renders input row (text input + H/M/L priority selector + Add button)
- Renders progress bar (completed / total)
- Renders three `KanbanColumn` components in a CSS grid

### KanbanColumn.tsx
- Props: `status`, `items[]`, `onMove`, `onDelete`, `onEdit`, `onClearAll?`
- Wraps card list in `SortableContext` from `@dnd-kit/sortable`
- Column header: title, item count badge, "Clear all" button (DONE column only)
- Column styling: colored top border (gray for PENDING, orange for IN PROGRESS, green for DONE)
- Background tint matching column status
- Empty column: shows a muted placeholder text ("No tasks") and remains a valid drop target via `useDroppable` fallback on the column container (min-height ensures droppable area)

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
- Drag cancellation (Escape or drop outside columns): card returns to original position, no state change

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
- Shows `completed / total` as text label (e.g., "2 / 5 done") where "completed" means `status === 'done'`
- Green fill bar (`#4caf50`) proportional to done count / total count
- Animates width changes with CSS transition

## Storage & Persistence

- Storage: `chrome.storage.local`, key `'todos'` (unchanged)
- New key: `'todoNextNumber'` for auto-increment counter
- Cross-tab sync: `storage.onChanged` listener watches both `'todos'` and `'todoNextNumber'` keys
- All mutations immediately persist to storage
- `todoNextNumber` is never decremented on delete or clearDone — numbers are never recycled

### Data Migration

On first load, check if **any** todo item has a `done` field but no `status` field. If so, migrate **all** items:
1. For each item: if `done` exists, map `done: true` → `status: 'done'`, `done: false` → `status: 'pending'`, then remove the `done` field. If item already has `status`, keep it as-is.
2. For items missing `number`: assign by `createdAt` order (1, 2, 3...)
3. For items missing `order`: assign by current array position (0, 1, 2...)
4. Set `todoNextNumber` to `max(all numbers) + 1`
5. Write migrated data back to storage

If todo array is empty, no migration needed — `todoNextNumber` defaults to 1.
Migration is idempotent: if all items already have `status` and `number`, no changes are made.

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
- No per-column item limit (unlimited todos)
- No ARIA roles or keyboard-based card movement beyond @dnd-kit's built-in KeyboardSensor support
