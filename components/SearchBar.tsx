import { useEffect, useRef, useState } from 'react';
import { useSearchEngine } from '@/hooks/useSearchEngine';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { SEARCH_ENGINES } from '@/core/constants';
import type { SearchEngineId } from '@/core/types';

export function SearchBar() {
  const { engine, setEngine } = useSearchEngine();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useSearchSuggestions(query, engine);

  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset highlight when suggestions change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [suggestions]);

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

  // Close suggestions on outside click
  useEffect(() => {
    if (!showSuggestions) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSuggestions]);

  const executeSearch = (text: string) => {
    if (!text.trim()) return;
    const url = engine.urlTemplate.replace('{query}', encodeURIComponent(text.trim()));
    window.open(url, '_blank');
  };

  const handleSearch = () => {
    executeSearch(query);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestionsOpen(false);
    executeSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Escape') {
        setSuggestionsOpen(false);
        return;
      }
      if (e.key === 'Enter') {
        if (highlightIndex >= 0) {
          handleSuggestionSelect(suggestions[highlightIndex]);
        } else {
          handleSearch();
        }
        return;
      }
    } else {
      if (e.key === 'Enter') {
        handleSearch();
      }
    }
  };

  const handleSelectEngine = (id: SearchEngineId) => {
    setEngine(id);
    setDropdownOpen(false);
    setSuggestionsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSuggestionsOpen(true);
  };

  return (
    <div ref={containerRef} className="search-bar-container w-full">
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
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${engine.name}...`}
          className="search-bar-input pixel-font"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          highlightIndex={highlightIndex}
          onSelect={handleSuggestionSelect}
          onHover={setHighlightIndex}
        />
      )}
    </div>
  );
}
