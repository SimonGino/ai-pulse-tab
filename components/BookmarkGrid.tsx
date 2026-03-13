import { useState, useEffect, useRef } from 'react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkModal } from './BookmarkModal';
import type { Bookmark } from '@/core/types';

interface ContextMenuState {
  bookmark: Bookmark;
  x: number;
  y: number;
}

export function BookmarkGrid() {
  const { bookmarks, addBookmark, editBookmark, deleteBookmark } = useBookmarks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Bookmark | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, bookmark: Bookmark) => {
    e.preventDefault();
    setContextMenu({ bookmark, x: e.clientX, y: e.clientY });
  };

  const handleEdit = (bookmark: Bookmark) => {
    setContextMenu(null);
    setEditingBookmark(bookmark);
    setModalOpen(true);
  };

  const handleDeleteRequest = (bookmark: Bookmark) => {
    setContextMenu(null);
    setConfirmDelete(bookmark);
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      deleteBookmark(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleSave = (name: string, url: string, letter: string, color: string) => {
    if (editingBookmark) {
      editBookmark(editingBookmark.id, { name, url, letter, color });
    } else {
      addBookmark(name, url, letter, color);
    }
    setModalOpen(false);
    setEditingBookmark(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBookmark(null);
  };

  return (
    <div className="w-full">
      <h3
        className="pixel-font text-xs mb-3"
        style={{ color: 'var(--pixel-pink)', fontSize: '9px' }}
      >
        BOOKMARKS
      </h3>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}
      >
        {bookmarks.map((bookmark) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card flex flex-col items-center gap-2 p-3 transition-all"
            onContextMenu={(e) => handleContextMenu(e, bookmark)}
            style={{
              '--hover-color': bookmark.color,
              backgroundColor: 'var(--pixel-dark)',
              boxShadow: `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `,
            } as React.CSSProperties}
          >
            <div
              className="pixel-font flex items-center justify-center"
              style={{
                width: '32px',
                height: '32px',
                fontSize: '16px',
                color: bookmark.color,
              }}
            >
              {bookmark.letter}
            </div>
            <span
              className="pixel-font"
              style={{ fontSize: '7px', color: 'var(--pixel-white)' }}
            >
              {bookmark.name}
            </span>
          </a>
        ))}

        {/* Add button */}
        <button
          onClick={() => { setEditingBookmark(null); setModalOpen(true); }}
          className="flex flex-col items-center justify-center gap-2 p-3 cursor-pointer transition-all"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: `
              -2px 0 0 0 var(--pixel-border),
              2px 0 0 0 var(--pixel-border),
              0 -2px 0 0 var(--pixel-border),
              0 2px 0 0 var(--pixel-border)
            `,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              var(--pixel-border),
              var(--pixel-border) 4px,
              transparent 4px,
              transparent 8px
            ),
            repeating-linear-gradient(
              90deg,
              var(--pixel-border),
              var(--pixel-border) 4px,
              transparent 4px,
              transparent 8px
            ),
            repeating-linear-gradient(
              180deg,
              var(--pixel-border),
              var(--pixel-border) 4px,
              transparent 4px,
              transparent 8px
            ),
            repeating-linear-gradient(
              270deg,
              var(--pixel-border),
              var(--pixel-border) 4px,
              transparent 4px,
              transparent 8px
            )`,
            backgroundSize: '2px 100%, 100% 2px, 2px 100%, 100% 2px',
            backgroundPosition: '0 0, 0 0, 100% 0, 0 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className="pixel-font flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              fontSize: '20px',
              color: 'var(--pixel-gray)',
            }}
          >
            +
          </div>
          <span
            className="pixel-font"
            style={{ fontSize: '7px', color: 'var(--pixel-gray)' }}
          >
            ADD
          </span>
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'var(--pixel-dark)',
            boxShadow: `
              -2px 0 0 0 var(--pixel-border),
              2px 0 0 0 var(--pixel-border),
              0 -2px 0 0 var(--pixel-border),
              0 2px 0 0 var(--pixel-border)
            `,
          }}
        >
          <button
            className="pixel-font block w-full text-left px-4 py-2 text-xs hover:bg-[#2a2a4e]"
            style={{ color: 'var(--pixel-white)', fontSize: '9px', border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => handleEdit(contextMenu.bookmark)}
          >
            EDIT
          </button>
          <button
            className="pixel-font block w-full text-left px-4 py-2 text-xs hover:bg-[#2a2a4e]"
            style={{ color: 'var(--pixel-red)', fontSize: '9px', border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={() => handleDeleteRequest(contextMenu.bookmark)}
          >
            DELETE
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="pixel-border p-6"
            style={{ backgroundColor: 'var(--pixel-dark)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="pixel-font text-xs mb-4" style={{ color: 'var(--pixel-white)' }}>
              Delete "{confirmDelete.name}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button className="pixel-btn" onClick={() => setConfirmDelete(null)}>
                CANCEL
              </button>
              <button
                className="pixel-btn"
                style={{ color: 'var(--pixel-red)' }}
                onClick={handleConfirmDelete}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <BookmarkModal
          bookmark={editingBookmark}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
