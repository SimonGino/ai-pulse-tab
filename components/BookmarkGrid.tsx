import { useState, useEffect, useRef } from 'react';
import { shouldCloseBookmarkContextMenu, deriveBookmarkLetter } from '@/core/bookmark-utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkModal } from './BookmarkModal';
import type { Bookmark } from '@/core/types';

function getFaviconUrl(bookmarkUrl: string): string | null {
  try {
    const { hostname } = new URL(bookmarkUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function BookmarkIcon({ bookmark }: { bookmark: Bookmark }) {
  const [imgFailed, setImgFailed] = useState(false);
  const faviconUrl = getFaviconUrl(bookmark.url);
  const fallbackLetter = deriveBookmarkLetter(bookmark.name, bookmark.letter);

  if (!faviconUrl || imgFailed) {
    return (
      <span
        className="pixel-font flex items-center justify-center"
        style={{ width: '20px', height: '20px', fontSize: '12px', color: 'var(--pixel-gray)' }}
      >
        {fallbackLetter}
      </span>
    );
  }

  return (
    <img
      src={faviconUrl}
      alt=""
      width={20}
      height={20}
      onError={() => setImgFailed(true)}
      style={{ imageRendering: 'auto' }}
    />
  );
}

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
    const handleClickOutside = (event: MouseEvent) => {
      if (shouldCloseBookmarkContextMenu(menuRef.current, event.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleSave = (name: string, url: string) => {
    if (editingBookmark) {
      editBookmark(editingBookmark.id, { name, url });
    } else {
      addBookmark(name, url);
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
        style={{ color: 'var(--pixel-gray)', fontSize: '9px' }}
      >
        BOOKMARKS
      </h3>
      <div className="flex flex-wrap gap-2">
        {bookmarks.map((bookmark) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            className="quick-link-card flex items-center gap-2 px-3 py-2 transition-all"
            onContextMenu={(e) => handleContextMenu(e, bookmark)}
            style={{
              '--hover-color': 'var(--pixel-gray)',
              minWidth: '100px',
              backgroundColor: 'var(--pixel-dark)',
              boxShadow: `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `,
              textDecoration: 'none',
            } as React.CSSProperties}
          >
            <BookmarkIcon bookmark={bookmark} />
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
          className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-all"
          style={{
            minWidth: '100px',
            backgroundColor: 'transparent',
            border: 'none',
            boxShadow: `
              -2px 0 0 0 var(--pixel-border),
              2px 0 0 0 var(--pixel-border),
              0 -2px 0 0 var(--pixel-border),
              0 2px 0 0 var(--pixel-border)
            `,
          }}
        >
          <span
            className="pixel-font flex items-center justify-center"
            style={{ width: '20px', height: '20px', fontSize: '14px', color: 'var(--pixel-gray)' }}
          >
            +
          </span>
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
