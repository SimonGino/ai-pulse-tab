interface SearchSuggestionsProps {
  suggestions: string[];
  highlightIndex: number;
  onSelect: (suggestion: string) => void;
  onHover: (index: number) => void;
}

export function SearchSuggestions({ suggestions, highlightIndex, onSelect, onHover }: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="search-suggestions pixel-border">
      {suggestions.map((item, i) => (
        <button
          key={item}
          className={`search-suggestion-item pixel-font${i === highlightIndex ? ' search-suggestion-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault(); // prevent input blur
            onSelect(item);
          }}
          onMouseEnter={() => onHover(i)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
