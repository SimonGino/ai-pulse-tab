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
