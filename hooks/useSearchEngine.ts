import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, SEARCH_ENGINES } from '@/core/constants';
import type { SearchEngineId } from '@/core/types';

const DEFAULT_ENGINE: SearchEngineId = 'google';

export function useSearchEngine() {
  const [engineId, setEngineId] = useState<SearchEngineId>(DEFAULT_ENGINE);

  useEffect(() => {
    browser.storage.local
      .get(STORAGE_KEYS.preferredSearchEngine)
      .then((result: Record<string, unknown>) => {
        const stored = result[STORAGE_KEYS.preferredSearchEngine] as SearchEngineId | undefined;
        if (stored) {
          setEngineId(stored);
        }
      });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.preferredSearchEngine]?.newValue) {
        setEngineId(changes[STORAGE_KEYS.preferredSearchEngine].newValue as SearchEngineId);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const setEngine = useCallback((id: SearchEngineId) => {
    setEngineId(id);
    browser.storage.local.set({ [STORAGE_KEYS.preferredSearchEngine]: id });
  }, []);

  const engine = SEARCH_ENGINES.find((e) => e.id === engineId) ?? SEARCH_ENGINES[0];

  return { engine, engineId, setEngine };
}
