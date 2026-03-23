import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

    return {
      id: item.id,
      number,
      text: item.text,
      status,
      priority: item.priority,
      order,
      createdAt: item.createdAt,
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

  const pending = useMemo(() => byStatus('pending'), [todos]);
  const inProgress = useMemo(() => byStatus('in-progress'), [todos]);
  const done = useMemo(() => byStatus('done'), [todos]);

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
