import { useState, useEffect, useRef } from 'react';
import { shouldCloseBookmarkContextMenu, deriveBookmarkLetter } from '@/core/bookmark-utils';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkModal } from './BookmarkModal';
import type { Bookmark } from '@/core/types';

const FALLBACK_COLORS = [
  { bg: 'rgba(212,132,90,0.15)', fg: 'var(--claude)' },
  { bg: 'rgba(107,200,143,0.12)', fg: 'var(--gpt)' },
  { bg: 'rgba(91,155,213,0.12)', fg: 'var(--blue)' },
  { bg: 'rgba(226,92,92,0.12)', fg: 'var(--danger)' },
  { bg: 'rgba(232,163,60,0.12)', fg: 'var(--warn)' },
  { bg: 'rgba(140,120,200,0.12)', fg: '#a08cdc' },
];

function getBookmarkColor(bookmark: Bookmark, index: number) {
  if (bookmark.color) {
    return { bg: `${bookmark.color}20`, fg: bookmark.color };
  }
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function getFaviconUrl(bookmarkUrl: string): string | null {
  try {
    const { hostname } = new URL(bookmarkUrl);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
}

function BookmarkIcon({ bookmark, index }: { bookmark: Bookmark; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const faviconUrl = getFaviconUrl(bookmark.url);
  const fallbackLetter = deriveBookmarkLetter(bookmark.name, bookmark.letter);
  const colors = getBookmarkColor(bookmark, index);

  return (
    <div
      className="dial-ico"
      style={{ background: colors.bg, color: colors.fg }}
    >
      {faviconUrl && !imgFailed ? (
        <img
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          onError={() => setImgFailed(true)}
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        fallbackLetter
      )}
    </div>
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
    <div className="dial-section">
      <div className="slabel">Speed dial</div>
      <div className="dial-grid">
        {bookmarks.map((bookmark, i) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            className="dial-item"
            onContextMenu={(e) => handleContextMenu(e, bookmark)}
          >
            <BookmarkIcon bookmark={bookmark} index={i} />
            <div className="dial-lbl">{bookmark.name}</div>
          </a>
        ))}

        <button
          className="dial-item dial-add"
          onClick={() => { setEditingBookmark(null); setModalOpen(true); }}
        >
          <div className="dial-ico">+</div>
          <div className="dial-lbl">Add</div>
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="ctx-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => handleEdit(contextMenu.bookmark)}>Edit</button>
          <button className="danger" onClick={() => handleDeleteRequest(contextMenu.bookmark)}>Delete</button>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Delete "{confirmDelete.name}"?</div>
            <div className="flex gap-2 justify-end">
              <button className="modal-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="modal-btn" style={{ color: 'var(--danger)' }} onClick={handleConfirmDelete}>Delete</button>
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
