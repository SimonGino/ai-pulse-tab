import { useEffect, useRef, useState } from 'react';
import type { SearchEngine } from '@/core/types';

export function useSearchSuggestions(query: string, engine: SearchEngine) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelledRef.current = true;

    // No suggestUrl or query too short → clear
    if (!engine.suggestUrl || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    cancelledRef.current = false;

    // Debounce 300ms
    timerRef.current = setTimeout(() => {
      const url = engine.suggestUrl!.replace('{query}', encodeURIComponent(query.trim()));

      // 2s timeout race
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 2000),
      );

      Promise.race([
        browser.runtime.sendMessage({ type: 'FETCH_SUGGESTIONS', url }),
        timeout,
      ])
        .then((response) => {
          if (cancelledRef.current) return;
          const res = response as { ok: boolean; data?: unknown };
          if (res?.ok) {
            setSuggestions(parseSuggestions(res.data).slice(0, 8));
          } else {
            setSuggestions([]);
          }
        })
        .catch(() => {
          if (!cancelledRef.current) setSuggestions([]);
        });
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelledRef.current = true;
    };
  }, [query, engine.suggestUrl]);

  return suggestions;
}

/**
 * Parse suggestions from different engine response formats.
 * Google: [query, [suggestions, ...], ...]
 * Bing/DuckDuckGo (OpenSearch JSON): [query, [suggestions, ...]]
 * Both share the same [string, string[]] shape.
 */
function parseSuggestions(data: unknown): string[] {
  if (!Array.isArray(data) || data.length < 2) return [];
  const items = data[1];
  if (!Array.isArray(items)) return [];
  return items.filter((item): item is string => typeof item === 'string');
}
