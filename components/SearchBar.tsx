import { useEffect, useRef, useState } from 'react';
import { useSearchEngine } from '@/hooks/useSearchEngine';
import { SEARCH_ENGINES } from '@/core/constants';
import type { SearchEngineId } from '@/core/types';

export function SearchBar() {
  const { engine, setEngine } = useSearchEngine();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleSearch = () => {
    if (!query.trim()) return;
    const url = engine.urlTemplate.replace('{query}', encodeURIComponent(query.trim()));
    window.open(url, '_blank');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectEngine = (id: SearchEngineId) => {
    setEngine(id);
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-container w-full">
      <div className="search-bar pixel-border">
        {/* Engine selector */}
        <div ref={dropdownRef} className="search-engine-selector">
          <button
            className="search-engine-btn pixel-font"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <span>{engine.icon}</span>
            <span className="search-engine-label">{engine.name}</span>
            <span className="search-engine-caret">▼</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="search-engine-dropdown pixel-border">
              {SEARCH_ENGINES.map((e) => (
                <button
                  key={e.id}
                  className={`search-engine-option pixel-font${e.id === engine.id ? ' search-engine-option-active' : ''}`}
                  onClick={() => handleSelectEngine(e.id)}
                >
                  <span className="search-engine-option-icon">{e.icon}</span>
                  <span>{e.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="search-bar-divider" />

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${engine.name}...`}
          className="search-bar-input pixel-font"
        />
      </div>
    </div>
  );
}
