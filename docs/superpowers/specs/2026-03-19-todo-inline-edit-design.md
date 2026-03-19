# Todo Inline Edit

**Date:** 2026-03-19
**Status:** Approved

## Overview

Add inline editing to todo items. Double-click text to enter edit mode, Enter/blur to save, Escape to cancel. Two files changed, no new files.

## Design

**Interaction:**
- Double-click todo text → text becomes `<input>` prefilled with current content
- Enter or blur → save (calls `editTodo`)
- Escape → cancel, restore original text
- Completed todos (done=true) are not editable
- Empty text on save → restore original (no empty tasks allowed)

**Hook change (`hooks/useTodos.ts`):**
- Add `editTodo(id: string, text: string)` method
- Pattern: same as `toggleTodo` — uses `applyTodos` to map over items, update matching id's text, persist

**Component change (`components/TodoList.tsx`):**
- Add `editingId` state (string | null)
- On double-click of `.t-txt` (when not done): set `editingId` to todo.id
- When `editingId` matches, render `<input>` instead of `<span>`
- Input uses existing `todo-inp` CSS class for consistent styling
- Input auto-focuses on mount via `autoFocus`
- onKeyDown: Enter → save and clear editingId, Escape → clear editingId without saving
- onBlur: save and clear editingId

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `hooks/useTodos.ts` | Edit | Add `editTodo` method |
| `components/TodoList.tsx` | Edit | Add editing state + inline input |
