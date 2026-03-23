# Todo Kanban Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the simple checklist TodoList with a three-column Kanban board (PENDING / IN PROGRESS / DONE) supporting drag-and-drop, quick-move buttons, progress bar, task numbering, and manual cleanup.

**Architecture:** Refactor data model from `done: boolean` to `status` enum with `order` field. Replace single `TodoList` component with `TodoKanban` containing `KanbanColumn` and `TodoCard` sub-components. Use `@dnd-kit` for drag-and-drop with `PointerSensor` (distance: 5) to avoid double-click conflicts.

**Tech Stack:** React 19, TypeScript, @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities, WXT (browser extension framework), chrome.storage.local

**Spec:** `docs/superpowers/specs/2026-03-23-todo-kanban-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `core/types.ts` | Update `TodoItem` interface (status, number, order) |
| Modify | `core/constants.ts` | Add `todoNextNumber` storage key |
| Rewrite | `hooks/useTodos.ts` | New API: addTodo, moveTodo, reorderInColumn, editTodo, deleteTodo, clearDone + migration |
| Create | `components/TodoKanban/TodoKanban.tsx` | Main component: DndContext, input row, progress bar, columns |
| Create | `components/TodoKanban/KanbanColumn.tsx` | Single column: header, SortableContext, card list, empty state |
| Create | `components/TodoKanban/TodoCard.tsx` | Draggable card: number, priority, text, quick-move, delete, inline edit |
| Create | `components/TodoKanban/index.ts` | Re-export |
| Modify | `entrypoints/newtab/App.tsx` | Swap `TodoList` → `TodoKanban` import |
| Modify | `entrypoints/newtab/style.css` | Replace `.todo-*` with `.kanban-*` styles + light theme |
| Delete | `components/TodoList.tsx` | Replaced by TodoKanban |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install @dnd-kit packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Verify installation**

Run: `ls node_modules/@dnd-kit`
Expected: `core`, `sortable`, `utilities` directories present

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit dependencies for kanban board"
```

---

### Task 2: Update data model and constants

**Files:**
- Modify: `core/types.ts:55-61`
- Modify: `core/constants.ts:24-31`

- [ ] **Step 1: Update TodoItem interface**

In `core/types.ts`, replace lines 55-61:

```typescript
export type TodoStatus = 'pending' | 'in-progress' | 'done';

export interface TodoItem {
  id: string;
  number: number;
  text: string;
  status: TodoStatus;
  priority: 'high' | 'med' | 'low';
  order: number;
  createdAt: number;
}
```

- [ ] **Step 2: Add storage key for todoNextNumber**

In `core/constants.ts`, add `todoNextNumber` to `STORAGE_KEYS` (after line 29):

```typescript
export const STORAGE_KEYS = {
  usageData: 'usageData',
  lastUpdated: 'lastUpdated',
  bookmarks: 'bookmarks',
  collapsedProviders: 'collapsedProviders',
  todos: 'todos',
  todoNextNumber: 'todoNextNumber',
  theme: 'theme',
} as const;
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build 2>&1 | head -20`
Expected: Build errors about `done` property in `useTodos.ts` and `TodoList.tsx` (expected — those files still reference old model)

- [ ] **Step 4: Commit**

```bash
git add core/types.ts core/constants.ts
git commit -m "feat: update TodoItem model with status, number, order fields"
```

---

### Task 3: Rewrite useTodos hook

**Files:**
- Rewrite: `hooks/useTodos.ts`

- [ ] **Step 1: Write the new hook**

Replace `hooks/useTodos.ts` entirely:

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/core/constants';
import type { TodoItem, TodoStatus } from '@/core/types';

interface OldTodoItem {
  id: string;
  text: string;
  done: boolean;
  priority: 'high' | 'med' | 'low';
  createdAt: number;
}

function migrateTodos(
  raw: (TodoItem | OldTodoItem)[],
): { todos: TodoItem[]; nextNumber: number } {
  const needsMigration = raw.some(
    (t) => 'done' in t && !('status' in t),
  );

  if (!needsMigration && raw.every((t) => 'status' in t && 'number' in t)) {
    const maxNum = raw.reduce(
      (max, t) => Math.max(max, (t as TodoItem).number ?? 0),
      0,
    );
    return { todos: raw as TodoItem[], nextNumber: maxNum + 1 };
  }

  const sorted = [...raw].sort((a, b) => a.createdAt - b.createdAt);
  let num = 1;
  const migrated: TodoItem[] = sorted.map((t, idx) => {
    const item = t as TodoItem & Partial<OldTodoItem>;
    const status: TodoStatus =
      'status' in item && item.status
        ? item.status
        : 'done' in item && item.done
          ? 'done'
          : 'pending';
    const number = 'number' in item && typeof item.number === 'number' ? item.number : num++;
    const order = 'order' in item && typeof item.order === 'number' ? item.order : idx;

    const { done: _done, ...rest } = item as Record<string, unknown>;
    return {
      id: rest.id as string,
      number,
      text: rest.text as string,
      status,
      priority: rest.priority as TodoItem['priority'],
      order,
      createdAt: rest.createdAt as number,
    };
  });

  const maxNum = migrated.reduce((max, t) => Math.max(max, t.number), 0);
  return { todos: migrated, nextNumber: maxNum + 1 };
}

function reindex(todos: TodoItem[], status: TodoStatus): TodoItem[] {
  // Extract items for this status, sort by current order, then reassign 0,1,2...
  const matching = todos
    .filter((t) => t.status === status)
    .sort((a, b) => a.order - b.order);
  const orderMap = new Map(matching.map((t, idx) => [t.id, idx]));
  return todos.map((t) =>
    orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
  );
}

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const todosRef = useRef<TodoItem[]>([]);
  const nextNumberRef = useRef(1);

  useEffect(() => {
    browser.storage.local
      .get([STORAGE_KEYS.todos, STORAGE_KEYS.todoNextNumber])
      .then((result: Record<string, unknown>) => {
        const stored = (result[STORAGE_KEYS.todos] ?? []) as (TodoItem | OldTodoItem)[];
        if (stored.length === 0) {
          todosRef.current = [];
          setTodos([]);
          return;
        }

        const { todos: migrated, nextNumber: nn } = migrateTodos(stored);
        const storedNN = result[STORAGE_KEYS.todoNextNumber] as number | undefined;
        const finalNN = storedNN && storedNN > nn ? storedNN : nn;

        todosRef.current = migrated;
        nextNumberRef.current = finalNN;
        setTodos(migrated);
        setNextNumber(finalNN);

        // Persist if migration occurred
        if (stored.some((t) => 'done' in t && !('status' in t))) {
          browser.storage.local.set({
            [STORAGE_KEYS.todos]: migrated,
            [STORAGE_KEYS.todoNextNumber]: finalNN,
          });
        }
      });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.todos]?.newValue) {
        const updated = changes[STORAGE_KEYS.todos].newValue as TodoItem[];
        todosRef.current = updated;
        setTodos(updated);
      }
      if (changes[STORAGE_KEYS.todoNextNumber]?.newValue) {
        const nn = changes[STORAGE_KEYS.todoNextNumber].newValue as number;
        nextNumberRef.current = nn;
        setNextNumber(nn);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const persist = useCallback((updated: TodoItem[], nn?: number) => {
    const payload: Record<string, unknown> = { [STORAGE_KEYS.todos]: updated };
    if (nn !== undefined) payload[STORAGE_KEYS.todoNextNumber] = nn;
    browser.storage.local.set(payload);
  }, []);

  const applyTodos = useCallback(
    (updater: (current: TodoItem[]) => TodoItem[], nn?: number) => {
      const updated = updater(todosRef.current);
      todosRef.current = updated;
      setTodos(updated);
      if (nn !== undefined) {
        nextNumberRef.current = nn;
        setNextNumber(nn);
      }
      persist(updated, nn);
    },
    [persist],
  );

  const addTodo = useCallback(
    (text: string, priority: TodoItem['priority']) => {
      const num = nextNumberRef.current;
      const pendingItems = todosRef.current.filter((t) => t.status === 'pending');
      const maxOrder = pendingItems.length > 0
        ? Math.max(...pendingItems.map((t) => t.order))
        : -1;
      applyTodos(
        (current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            number: num,
            text,
            status: 'pending' as TodoStatus,
            priority,
            order: maxOrder + 1,
            createdAt: Date.now(),
          },
        ],
        num + 1,
      );
    },
    [applyTodos],
  );

  const moveTodo = useCallback(
    (id: string, targetStatus: TodoStatus, targetIndex?: number) => {
      applyTodos((current) => {
        const todo = current.find((t) => t.id === id);
        if (!todo) return current;

        const sourceStatus = todo.status;

        // Get target column items (excluding the moved item), sorted by order
        const targetItems = current
          .filter((t) => t.status === targetStatus && t.id !== id)
          .sort((a, b) => a.order - b.order);

        // Insert at targetIndex or append to end
        const insertAt = targetIndex ?? targetItems.length;
        targetItems.splice(insertAt, 0, {
          ...todo,
          status: targetStatus,
        });

        // Assign sequential orders to the target column
        const targetOrderMap = new Map(
          targetItems.map((t, idx) => [t.id, idx]),
        );

        let updated = current.map((t) => {
          if (targetOrderMap.has(t.id)) {
            return { ...t, status: targetStatus, order: targetOrderMap.get(t.id)! };
          }
          return t;
        });

        // Re-index source column if cross-column move
        if (sourceStatus !== targetStatus) {
          updated = reindex(updated, sourceStatus);
        }

        return updated;
      });
    },
    [applyTodos],
  );

  const reorderInColumn = useCallback(
    (status: TodoStatus, orderedIds: string[]) => {
      applyTodos((current) => {
        const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
        return current.map((t) =>
          orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
        );
      });
    },
    [applyTodos],
  );

  const editTodo = useCallback(
    (id: string, text: string) => {
      applyTodos((current) =>
        current.map((t) => (t.id === id ? { ...t, text } : t)),
      );
    },
    [applyTodos],
  );

  const deleteTodo = useCallback(
    (id: string) => {
      applyTodos((current) => {
        const todo = current.find((t) => t.id === id);
        const filtered = current.filter((t) => t.id !== id);
        return todo ? reindex(filtered, todo.status) : filtered;
      });
    },
    [applyTodos],
  );

  const clearDone = useCallback(() => {
    applyTodos((current) => current.filter((t) => t.status !== 'done'));
  }, [applyTodos]);

  // Group by status, sorted by order within each group
  const byStatus = (status: TodoStatus) =>
    todos
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);

  const pending = byStatus('pending');
  const inProgress = byStatus('in-progress');
  const done = byStatus('done');

  const doneCount = done.length;
  const totalCount = todos.length;

  return {
    todos,
    pending,
    inProgress,
    done,
    doneCount,
    totalCount,
    addTodo,
    moveTodo,
    reorderInColumn,
    editTodo,
    deleteTodo,
    clearDone,
  };
}
```

- [ ] **Step 2: Verify the file compiles on its own**

Run: `npx tsc --noEmit hooks/useTodos.ts 2>&1 | head -10`
Expected: May show errors about browser global (WXT provides it), but no TypeScript type errors in the hook logic itself.

- [ ] **Step 3: Commit**

```bash
git add hooks/useTodos.ts
git commit -m "feat: rewrite useTodos hook with kanban status, ordering, migration"
```

---

### Task 4: Create TodoCard component

**Files:**
- Create: `components/TodoKanban/TodoCard.tsx`

- [ ] **Step 1: Write TodoCard**

```typescript
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TodoItem, TodoStatus } from '@/core/types';

const PRIORITY_LABELS: Record<TodoItem['priority'], string> = {
  high: 'HIGH',
  med: 'MED',
  low: 'LOW',
};

const STATUS_ORDER: TodoStatus[] = ['pending', 'in-progress', 'done'];

interface TodoCardProps {
  todo: TodoItem;
  onMove: (id: string, targetStatus: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoCard({ todo, onMove, onDelete, onEdit }: TodoCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, data: { status: todo.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const statusIdx = STATUS_ORDER.indexOf(todo.status);
  const canMoveLeft = statusIdx > 0;
  const canMoveRight = statusIdx < STATUS_ORDER.length - 1;

  const handleDoubleClick = () => {
    if (todo.status === 'done') return;
    setEditing(true);
    setEditText(todo.text);
  };

  const handleEditSave = () => {
    const trimmed = editText.trim();
    if (trimmed) onEdit(todo.id, trimmed);
    setEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-card ${todo.status === 'done' ? 'done' : ''}`}
      {...attributes}
      {...(editing ? {} : listeners)}
    >
      <button
        className="card-del"
        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
        aria-label="Delete task"
      >
        ×
      </button>

      <div className="card-header">
        <span className="card-num">#{todo.number}</span>
        <span className={`card-pri cp-${todo.priority[0]}`}>
          {PRIORITY_LABELS[todo.priority]}
        </span>
      </div>

      {editing ? (
        <input
          className="card-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleEditSave}
          autoFocus
        />
      ) : (
        <div
          className={`card-text ${todo.status === 'done' ? 'done' : ''}`}
          onDoubleClick={handleDoubleClick}
        >
          {todo.text}
        </div>
      )}

      <div className="card-actions">
        {canMoveLeft && (
          <button
            className={`card-move move-${STATUS_ORDER[statusIdx - 1]}`}
            onClick={(e) => {
              e.stopPropagation();
              onMove(todo.id, STATUS_ORDER[statusIdx - 1]);
            }}
            aria-label={`Move to ${STATUS_ORDER[statusIdx - 1]}`}
          >
            ←
          </button>
        )}
        <div style={{ flex: 1 }} />
        {canMoveRight && (
          <button
            className={`card-move move-${STATUS_ORDER[statusIdx + 1]}`}
            onClick={(e) => {
              e.stopPropagation();
              onMove(todo.id, STATUS_ORDER[statusIdx + 1]);
            }}
            aria-label={`Move to ${STATUS_ORDER[statusIdx + 1]}`}
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
mkdir -p components/TodoKanban
git add components/TodoKanban/TodoCard.tsx
git commit -m "feat: add TodoCard component with drag, edit, quick-move"
```

---

### Task 5: Create KanbanColumn component

**Files:**
- Create: `components/TodoKanban/KanbanColumn.tsx`

- [ ] **Step 1: Write KanbanColumn**

```typescript
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TodoCard } from './TodoCard';
import type { TodoItem, TodoStatus } from '@/core/types';

const COLUMN_CONFIG: Record<
  TodoStatus,
  { title: string; className: string }
> = {
  pending: { title: 'PENDING', className: 'col-pending' },
  'in-progress': { title: 'IN PROGRESS', className: 'col-progress' },
  done: { title: 'DONE', className: 'col-done' },
};

interface KanbanColumnProps {
  status: TodoStatus;
  items: TodoItem[];
  onMove: (id: string, targetStatus: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onClearAll?: () => void;
}

export function KanbanColumn({
  status,
  items,
  onMove,
  onDelete,
  onEdit,
  onClearAll,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: `column-${status}` });
  const config = COLUMN_CONFIG[status];

  return (
    <div className={`kanban-col ${config.className}`}>
      <div className="col-header">
        <div className="col-title-row">
          <span className="col-title">{config.title}</span>
          <span className="col-count">{items.length}</span>
        </div>
        {status === 'done' && items.length > 0 && onClearAll && (
          <button className="col-clear" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      <SortableContext
        items={items.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="col-cards">
          {items.length === 0 ? (
            <div className="col-empty">No tasks</div>
          ) : (
            items.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onMove={onMove}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TodoKanban/KanbanColumn.tsx
git commit -m "feat: add KanbanColumn component with sortable context"
```

---

### Task 6: Create TodoKanban main component

**Files:**
- Create: `components/TodoKanban/TodoKanban.tsx`
- Create: `components/TodoKanban/index.ts`

- [ ] **Step 1: Write TodoKanban**

```typescript
import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useTodos } from '@/hooks/useTodos';
import { KanbanColumn } from './KanbanColumn';
import { TodoCard } from './TodoCard';
import type { TodoItem, TodoStatus } from '@/core/types';

const STATUSES: TodoStatus[] = ['pending', 'in-progress', 'done'];

export function TodoKanban() {
  const {
    pending,
    inProgress,
    done,
    doneCount,
    totalCount,
    addTodo,
    moveTodo,
    reorderInColumn,
    editTodo,
    deleteTodo,
    clearDone,
  } = useTodos();

  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('high');
  const [activeTodo, setActiveTodo] = useState<TodoItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTodo(text, priority);
    setInput('');
  };

  const getColumnItems = useCallback(
    (status: TodoStatus): TodoItem[] => {
      switch (status) {
        case 'pending': return pending;
        case 'in-progress': return inProgress;
        case 'done': return done;
      }
    },
    [pending, inProgress, done],
  );

  const findTodoStatus = useCallback(
    (id: string): TodoStatus | undefined => {
      for (const status of STATUSES) {
        if (getColumnItems(status).some((t) => t.id === id)) return status;
      }
      return undefined;
    },
    [getColumnItems],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const allItems = [...pending, ...inProgress, ...done];
    setActiveTodo(allItems.find((t) => t.id === id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTodo(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeStatus = findTodoStatus(activeId);
    if (!activeStatus) return;

    // Dropped on a column droppable (e.g., "column-done")
    if (overId.startsWith('column-')) {
      const targetStatus = overId.replace('column-', '') as TodoStatus;
      if (targetStatus !== activeStatus) {
        moveTodo(activeId, targetStatus);
      }
      return;
    }

    // Dropped on another card
    const overStatus = findTodoStatus(overId);
    if (!overStatus) return;

    if (activeStatus === overStatus) {
      // Intra-column reorder — single atomic update
      const items = getColumnItems(activeStatus);
      const oldIndex = items.findIndex((t) => t.id === activeId);
      const newIndex = items.findIndex((t) => t.id === overId);
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(items, oldIndex, newIndex);
        reorderInColumn(activeStatus, reordered.map((t) => t.id));
      }
    } else {
      // Cross-column move: append to target column
      moveTodo(activeId, overStatus);
    }
  };

  const handleDragCancel = () => {
    setActiveTodo(null);
  };

  const progressPercent =
    totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <div className="kanban-section">
      <div className="kanban-header">
        <div>
          <div className="slabel">Today's focus</div>
          <div className="kanban-cnt">
            {doneCount} / {totalCount} done
          </div>
        </div>
        <div className="kanban-inp-row">
          <input
            className="kanban-inp"
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
          <button className="kanban-add" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>

      <div className="kanban-progress">
        <div
          className="kanban-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-columns">
          <KanbanColumn
            status="pending"
            items={pending}
            onMove={moveTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
          <KanbanColumn
            status="in-progress"
            items={inProgress}
            onMove={moveTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
          <KanbanColumn
            status="done"
            items={done}
            onMove={moveTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
            onClearAll={clearDone}
          />
        </div>

        <DragOverlay>
          {activeTodo ? (
            <TodoCard
              todo={activeTodo}
              onMove={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
```

- [ ] **Step 2: Write index.ts**

```typescript
export { TodoKanban } from './TodoKanban';
```

- [ ] **Step 3: Commit**

```bash
git add components/TodoKanban/TodoKanban.tsx components/TodoKanban/index.ts
git commit -m "feat: add TodoKanban main component with DndContext"
```

---

### Task 7: Update App.tsx to use TodoKanban

**Files:**
- Modify: `entrypoints/newtab/App.tsx:5,114`
- Delete: `components/TodoList.tsx`

- [ ] **Step 1: Swap import and usage in App.tsx**

Replace line 5:
```typescript
// Old:
import { TodoList } from '@/components/TodoList';
// New:
import { TodoKanban } from '@/components/TodoKanban';
```

Replace line 114:
```typescript
// Old:
<TodoList />
// New:
<TodoKanban />
```

- [ ] **Step 2: Delete old TodoList**

```bash
rm components/TodoList.tsx
```

- [ ] **Step 3: Commit**

```bash
git add entrypoints/newtab/App.tsx
git rm components/TodoList.tsx
git commit -m "feat: swap TodoList for TodoKanban in App layout"
```

---

### Task 8: Replace CSS styles

**Files:**
- Modify: `entrypoints/newtab/style.css`

- [ ] **Step 1: Remove old todo CSS**

Remove the entire `/* === Todo === */` section: from the `/* === Todo === */` comment down through `.t-del:hover { color: var(--danger); }`. This includes all classes: `.todo-section`, `.todo-cnt`, `.todo-inp-row`, `.todo-inp`, `.pri-btns`, `.pri-btn`, `.pb-h/m/l`, `.todo-add`, `.todo-list`, `.todo-item`, `.t-chk`, `.t-txt`, `.t-pri`, `.tp-h/m/l`, `.t-del`.

- [ ] **Step 2: Remove old todo light theme overrides**

In the `[data-theme="light"]` section, remove all rules that reference `.todo-*`, `.t-chk`, `.t-del`, `.pri-btn`, or `.todo-add` class selectors. Identify them by searching for these class names rather than by line number (line numbers will have shifted after Step 1).

- [ ] **Step 3: Add new kanban CSS**

Insert the following where the old todo section was (before the `/* === Modal === */` section):

```css
/* === Kanban === */
.kanban-section { display: flex; flex-direction: column; flex: 1; min-height: 0; }
.kanban-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-shrink: 0; }
.kanban-cnt { font-size: 10px; color: var(--t3); font-family: 'Space Mono', monospace; margin-top: 2px; }
.kanban-inp-row { display: flex; align-items: center; gap: 4px; }
.kanban-inp {
  background: var(--inp);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 5px 8px;
  font-size: 10px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  outline: none;
  width: 170px;
}
.kanban-inp:focus { border-color: rgba(255,255,255,0.15); }
.kanban-inp::placeholder { color: var(--t3); }
.kanban-add {
  background: rgba(255,255,255,0.06);
  border: 0.5px solid var(--bd);
  border-radius: var(--rs);
  padding: 0 10px;
  font-size: 9px;
  color: var(--t2);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  height: 26px;
  flex-shrink: 0;
}
.kanban-add:hover { background: rgba(255,255,255,0.1); color: var(--t1); }

/* Progress bar */
.kanban-progress {
  height: 3px;
  background: rgba(255,255,255,0.06);
  border-radius: 2px;
  margin-bottom: 14px;
  flex-shrink: 0;
}
.kanban-progress-fill {
  height: 100%;
  background: var(--gpt);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Columns grid */
.kanban-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  flex: 1;
  min-height: 0;
}

/* Column */
.kanban-col {
  background: rgba(255,255,255,0.02);
  border-radius: 10px;
  padding: 10px;
  border-top: 2px solid rgba(255,255,255,0.1);
  display: flex;
  flex-direction: column;
  min-height: 120px;
}
.col-pending { border-top-color: rgba(255,255,255,0.1); }
.col-progress { border-top-color: var(--warn); background: rgba(232,163,60,0.04); }
.col-done { border-top-color: var(--gpt); background: rgba(107,200,143,0.04); }

.col-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-shrink: 0; }
.col-title-row { display: flex; align-items: center; gap: 6px; }
.col-title { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--t2); }
.col-progress .col-title { color: var(--warn); }
.col-done .col-title { color: var(--gpt); }
.col-count {
  font-size: 8px;
  color: var(--t3);
  background: rgba(255,255,255,0.06);
  padding: 1px 5px;
  border-radius: 8px;
}
.col-progress .col-count { color: var(--warn); background: rgba(232,163,60,0.15); }
.col-done .col-count { color: var(--gpt); background: rgba(107,200,143,0.15); }

.col-clear {
  font-size: 8px;
  color: var(--danger);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(226,92,92,0.08);
  border: none;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}
.col-clear:hover { background: rgba(226,92,92,0.15); }

.col-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  overflow-y: auto;
  padding-right: 2px;
}
.col-cards::-webkit-scrollbar { width: 3px; }
.col-cards::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.col-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 9px;
  color: var(--t3);
  font-style: italic;
}

/* Card */
.kanban-card {
  background: var(--card);
  border-radius: 8px;
  padding: 10px;
  cursor: grab;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}
.kanban-card:hover { background: var(--card-h); border-color: rgba(255,255,255,0.08); }
.kanban-card.done { opacity: 0.6; }
.kanban-card:active { cursor: grabbing; }

.card-del {
  position: absolute;
  top: 6px;
  right: 6px;
  opacity: 0;
  font-size: 12px;
  color: var(--t3);
  cursor: pointer;
  padding: 0 2px;
  background: none;
  border: none;
  transition: all 0.15s;
  line-height: 1;
}
.kanban-card:hover .card-del { opacity: 1; }
.card-del:hover { color: var(--danger); }

.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.card-num { font-size: 8px; color: var(--t3); }
.card-pri {
  font-size: 7px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 2px;
  letter-spacing: 0.3px;
}
.cp-h { background: rgba(226,92,92,0.15); color: var(--danger); }
.cp-m { background: rgba(232,163,60,0.12); color: var(--warn); }
.cp-l { background: rgba(91,155,213,0.12); color: var(--blue); }

.card-text { font-size: 11px; color: var(--t1); line-height: 1.4; margin-bottom: 6px; }
.card-text.done { text-decoration: line-through; color: var(--t3); }

.card-edit-input {
  width: 100%;
  background: var(--inp);
  border: 0.5px solid var(--bd);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--t1);
  font-family: 'DM Sans', sans-serif;
  outline: none;
  margin-bottom: 6px;
}
.card-edit-input:focus { border-color: rgba(255,255,255,0.15); }

.card-actions { display: flex; justify-content: space-between; opacity: 0; transition: opacity 0.15s; }
.kanban-card:hover .card-actions { opacity: 1; }

.card-move {
  font-size: 9px;
  cursor: pointer;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255,255,255,0.04);
  border: none;
  transition: all 0.15s;
  color: var(--t3);
  font-family: 'DM Sans', sans-serif;
}
.card-move:hover { background: rgba(255,255,255,0.08); }
.move-pending { color: var(--t2); }
.move-pending:hover { background: rgba(255,255,255,0.08); }
.move-in-progress { color: var(--warn); }
.move-in-progress:hover { background: rgba(232,163,60,0.12); }
.move-done { color: var(--gpt); }
.move-done:hover { background: rgba(107,200,143,0.12); }

/* Pri buttons (shared, keep from old CSS) */
.pri-btns { display: flex; gap: 2px; flex-shrink: 0; }
.pri-btn {
  width: 20px;
  height: 20px;
  border-radius: 3px;
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

/* Drag overlay */
[data-dnd-kit-drag-overlay] .kanban-card {
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  opacity: 0.9;
  cursor: grabbing;
}

/* === Light Theme — Kanban overrides === */
[data-theme="light"] .kanban-inp:focus { border-color: rgba(0,0,0,0.15); }
[data-theme="light"] .kanban-add { background: rgba(0,0,0,0.04); }
[data-theme="light"] .kanban-add:hover { background: rgba(0,0,0,0.06); }
[data-theme="light"] .kanban-progress { background: rgba(0,0,0,0.06); }
[data-theme="light"] .kanban-col { background: rgba(0,0,0,0.02); }
[data-theme="light"] .col-pending { border-top-color: rgba(0,0,0,0.1); }
[data-theme="light"] .col-progress { background: rgba(232,163,60,0.06); }
[data-theme="light"] .col-done { background: rgba(107,200,143,0.06); }
[data-theme="light"] .col-count { background: rgba(0,0,0,0.06); }
[data-theme="light"] .col-progress .col-count { background: rgba(232,163,60,0.12); }
[data-theme="light"] .col-done .col-count { background: rgba(107,200,143,0.12); }
[data-theme="light"] .kanban-card { border-color: rgba(0,0,0,0.06); }
[data-theme="light"] .kanban-card:hover { background: rgba(0,0,0,0.03); border-color: rgba(0,0,0,0.1); }
[data-theme="light"] .card-edit-input:focus { border-color: rgba(0,0,0,0.15); }
[data-theme="light"] .pri-btn.sel { outline-color: rgba(0,0,0,0.2); }
[data-theme="light"] .col-cards::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
[data-theme="light"] .card-move:hover { background: rgba(0,0,0,0.06); }
[data-theme="light"] .col-clear:hover { background: rgba(226,92,92,0.12); }
[data-theme="light"] [data-dnd-kit-drag-overlay] .kanban-card { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
```

- [ ] **Step 5: Commit**

```bash
git add entrypoints/newtab/style.css
git commit -m "feat: replace todo CSS with kanban board styles"
```

---

### Task 9: Build and verify

**Files:** None (verification only)

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected: Clean build with no errors.

- [ ] **Step 2: Run dev server and test manually**

```bash
npm run dev
```

Open a new tab in the browser. Verify:
- Three-column kanban board renders below Speed Dial
- Add a task — appears in PENDING column with #1
- Click → button — moves to IN PROGRESS
- Click → button — moves to DONE (strikethrough + dimmed)
- Click ← button — moves back
- Drag a card between columns
- Drag a card within a column to reorder
- Double-click to edit a task
- Hover shows × delete button
- "Clear all" button in DONE column header
- Progress bar fills proportionally
- Light theme toggle works

- [ ] **Step 3: Test data migration**

If you have existing todos from before the upgrade, verify they appear in PENDING (incomplete) or DONE (completed) columns with auto-assigned numbers.

- [ ] **Step 4: Commit any fixes**

If manual testing reveals issues, fix and commit:
```bash
git add -A
git commit -m "fix: address issues found during kanban manual testing"
```
