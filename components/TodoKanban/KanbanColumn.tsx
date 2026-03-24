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
