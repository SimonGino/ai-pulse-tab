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
    <div className="search-bar-container w-full" style={{ maxWidth: '1200px' }}>
      <div className="search-bar pixel-border" style={{ background: 'var(--pixel-dark)', display: 'flex', alignItems: 'center', position: 'relative' }}>
        {/* Engine selector */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="search-engine-btn pixel-font"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--pixel-yellow)',
              cursor: 'pointer',
              padding: '8px 12px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{engine.icon}</span>
            <span style={{ fontSize: '8px', color: 'var(--pixel-white)' }}>{engine.name}</span>
            <span style={{ fontSize: '6px', color: 'var(--pixel-gray)' }}>▼</span>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="search-engine-dropdown pixel-border"
              style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                marginTop: '8px',
                background: 'var(--pixel-dark)',
                zIndex: 50,
                minWidth: '140px',
              }}
            >
              {SEARCH_ENGINES.map((e) => (
                <button
                  key={e.id}
                  className="search-engine-option pixel-font"
                  onClick={() => handleSelectEngine(e.id as SearchEngineId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    background: e.id === engine.id ? '#2a2a4e' : 'transparent',
                    border: 'none',
                    color: e.id === engine.id ? 'var(--pixel-yellow)' : 'var(--pixel-white)',
                    cursor: 'pointer',
                    fontSize: '8px',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: 'var(--pixel-yellow)' }}>{e.icon}</span>
                  <span>{e.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '2px', height: '20px', background: 'var(--pixel-border)' }} />

        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${engine.name}...`}
          className="pixel-font"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--pixel-white)',
            padding: '10px 12px',
            fontSize: '10px',
            minWidth: 0,
          }}
        />
      </div>
    </div>
  );
}
