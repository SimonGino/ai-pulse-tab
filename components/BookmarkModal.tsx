import { useState } from 'react';
import {
  deriveBookmarkLetter,
  normalizeBookmarkLetter,
  validateBookmarkForm,
} from '@/core/bookmark-utils';
import { BOOKMARK_COLORS } from '@/core/constants';
import type { Bookmark } from '@/core/types';

interface BookmarkModalProps {
  bookmark: Bookmark | null;
  onSave: (name: string, url: string, letter: string, color: string) => void;
  onClose: () => void;
}

export function BookmarkModal({ bookmark, onSave, onClose }: BookmarkModalProps) {
  const [name, setName] = useState(bookmark?.name ?? '');
  const [url, setUrl] = useState(bookmark?.url ?? '');
  const [letter, setLetter] = useState(bookmark?.letter ?? '');
  const [color, setColor] = useState(bookmark?.color ?? BOOKMARK_COLORS[0]);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const derivedLetter = deriveBookmarkLetter(name, letter);

  const handleSubmit = () => {
    const newErrors = validateBookmarkForm(name, url);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(name.trim(), url.trim(), derivedLetter, color);
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
          style={{ color: 'var(--pixel-yellow)' }}
        >
          {bookmark ? 'EDIT BOOKMARK' : 'ADD BOOKMARK'}
        </h3>

        {/* Letter preview */}
        <div className="flex justify-center mb-4">
          <div
            className="pixel-font flex items-center justify-center"
            style={{
              width: '48px',
              height: '48px',
              fontSize: '24px',
              color,
              backgroundColor: 'var(--pixel-black)',
              boxShadow: `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `,
            }}
          >
            {derivedLetter}
          </div>
        </div>

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

        {/* Letter input */}
        <div className="mb-3">
          <label
            className="pixel-font block mb-1"
            style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}
          >
            LETTER (auto from name)
          </label>
          <input
            type="text"
            value={letter}
            onChange={(e) => setLetter(normalizeBookmarkLetter(e.target.value))}
            className="pixel-font w-full p-2 outline-none"
            style={{
              fontSize: '10px',
              backgroundColor: 'var(--pixel-black)',
              color: 'var(--pixel-white)',
              border: 'none',
              boxShadow: `
                -2px 0 0 0 var(--pixel-border),
                2px 0 0 0 var(--pixel-border),
                0 -2px 0 0 var(--pixel-border),
                0 2px 0 0 var(--pixel-border)
              `,
            }}
            placeholder="Auto"
          />
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <label
            className="pixel-font block mb-2"
            style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}
          >
            COLOR
          </label>
          <div className="flex flex-wrap gap-2">
            {BOOKMARK_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: c,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: color === c
                    ? `0 0 0 2px var(--pixel-black), 0 0 0 4px var(--pixel-yellow)`
                    : `0 0 0 2px var(--pixel-black)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button className="pixel-btn" onClick={onClose}>
            CANCEL
          </button>
          <button
            className="pixel-btn"
            style={{ color: 'var(--pixel-green)' }}
            onClick={handleSubmit}
          >
            {bookmark ? 'SAVE' : 'ADD'}
          </button>
        </div>
      </div>
    </div>
  );
}
