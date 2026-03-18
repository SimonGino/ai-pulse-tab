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
