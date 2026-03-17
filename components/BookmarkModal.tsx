import { useState } from 'react';
import { validateBookmarkForm } from '@/core/bookmark-utils';
import type { Bookmark } from '@/core/types';

interface BookmarkModalProps {
  bookmark: Bookmark | null;
  onSave: (name: string, url: string) => void;
  onClose: () => void;
}

export function BookmarkModal({ bookmark, onSave, onClose }: BookmarkModalProps) {
  const [name, setName] = useState(bookmark?.name ?? '');
  const [url, setUrl] = useState(bookmark?.url ?? '');
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const handleSubmit = () => {
    const newErrors = validateBookmarkForm(name, url);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(name.trim(), url.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="pixel-border p-6 w-80"
        style={{ backgroundColor: 'var(--pixel-dark)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="pixel-font text-xs mb-4"
          style={{ color: 'var(--pixel-white)' }}
        >
          {bookmark ? 'EDIT BOOKMARK' : 'ADD BOOKMARK'}
        </h3>

        {/* Name input */}
        <div className="mb-3">
          <label
            className="pixel-font block mb-1"
            style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}
          >
            NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            className="pixel-font w-full p-2 outline-none"
            style={{
              fontSize: '10px',
              backgroundColor: 'var(--pixel-black)',
              color: 'var(--pixel-white)',
              border: 'none',
              boxShadow: `
                -2px 0 0 0 ${errors.name ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                2px 0 0 0 ${errors.name ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                0 -2px 0 0 ${errors.name ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                0 2px 0 0 ${errors.name ? 'var(--pixel-red)' : 'var(--pixel-border)'}
              `,
            }}
            placeholder="e.g. GitHub"
          />
          {errors.name && (
            <p className="pixel-font mt-1" style={{ fontSize: '7px', color: 'var(--pixel-red)' }}>
              {errors.name}
            </p>
          )}
        </div>

        {/* URL input */}
        <div className="mb-3">
          <label
            className="pixel-font block mb-1"
            style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}
          >
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            className="pixel-font w-full p-2 outline-none"
            style={{
              fontSize: '10px',
              backgroundColor: 'var(--pixel-black)',
              color: 'var(--pixel-white)',
              border: 'none',
              boxShadow: `
                -2px 0 0 0 ${errors.url ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                2px 0 0 0 ${errors.url ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                0 -2px 0 0 ${errors.url ? 'var(--pixel-red)' : 'var(--pixel-border)'},
                0 2px 0 0 ${errors.url ? 'var(--pixel-red)' : 'var(--pixel-border)'}
              `,
            }}
            placeholder="https://..."
          />
          {errors.url && (
            <p className="pixel-font mt-1" style={{ fontSize: '7px', color: 'var(--pixel-red)' }}>
              {errors.url}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button className="pixel-btn" onClick={onClose}>
            CANCEL
          </button>
          <button
            className="pixel-btn"
            style={{ color: 'var(--pixel-white)' }}
            onClick={handleSubmit}
          >
            {bookmark ? 'SAVE' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  );
}
