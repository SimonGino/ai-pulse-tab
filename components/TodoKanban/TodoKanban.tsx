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
    setActiveTodo(todos.find((t) => t.id === id) ?? null);
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
      // Cross-column move: insert at hovered card's position
      const targetItems = getColumnItems(overStatus);
      const targetIndex = targetItems.findIndex((t) => t.id === overId);
      moveTodo(activeId, overStatus, targetIndex >= 0 ? targetIndex : undefined);
    }
  };

  const handleDragCancel = () => {
    setActiveTodo(null);
  };

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
