import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import type { TodoItem } from '@/core/types';

const PRIORITY_LABELS: Record<TodoItem['priority'], string> = {
  high: 'HIGH',
  med: 'MED',
  low: 'LOW',
};

export function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<TodoItem['priority']>('high');

  const handleAdd = () => {
    const text = input.trim();
    if (!text) return;
    addTodo(text, priority);
    setInput('');
  };

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <div className="todo-section">
      <div className="slabel">Today's focus</div>
      <div className="todo-cnt">{doneCount} / {todos.length} done</div>

      <div className="todo-inp-row">
        <input
          className="todo-inp"
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
        <button className="todo-add" onClick={handleAdd}>Add</button>
      </div>

      <div className="todo-list">
        {todos.map((todo) => (
          <div key={todo.id} className="todo-item">
            <div
              className={`t-chk ${todo.done ? 'dn' : ''}`}
              role="checkbox"
              aria-checked={todo.done}
              tabIndex={0}
              onClick={() => toggleTodo(todo.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTodo(todo.id); } }}
            />
            <span className={`t-txt ${todo.done ? 'dn' : ''}`}>{todo.text}</span>
            <span className={`t-pri tp-${todo.priority[0]}`}>
              {PRIORITY_LABELS[todo.priority]}
            </span>
            <button className="t-del" onClick={() => deleteTodo(todo.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
