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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">
          {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
        </div>

        <div className="mb-3">
          <label className="modal-label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            className={`modal-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g. GitHub"
          />
          {errors.name && <div className="modal-error">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label className="modal-label">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            className={`modal-input ${errors.url ? 'error' : ''}`}
            placeholder="https://..."
          />
          {errors.url && <div className="modal-error">{errors.url}</div>}
        </div>

        <div className="flex gap-2 justify-end">
          <button className="modal-btn" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn-primary" onClick={handleSubmit}>
            {bookmark ? 'Save' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
