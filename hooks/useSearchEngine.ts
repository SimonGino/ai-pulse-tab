import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, SEARCH_ENGINES } from '@/core/constants';
import {
  isSearchEngineId,
  loadPreferredSearchEngineId,
  persistPreferredSearchEngineId,
} from '@/core/search-engine-utils';
import type { SearchEngineId } from '@/core/types';

const DEFAULT_ENGINE: SearchEngineId = 'google';

export function useSearchEngine() {
  const [engineId, setEngineId] = useState<SearchEngineId>(DEFAULT_ENGINE);

  useEffect(() => {
    let active = true;

    void loadPreferredSearchEngineId(
      () => browser.storage.local.get(STORAGE_KEYS.preferredSearchEngine),
      DEFAULT_ENGINE,
    ).then((storedId) => {
      if (active) {
        setEngineId(storedId);
      }
    });

    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      const nextValue = changes[STORAGE_KEYS.preferredSearchEngine]?.newValue;
      if (isSearchEngineId(nextValue)) {
        setEngineId(nextValue);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => {
      active = false;
      browser.storage.local.onChanged.removeListener(listener);
    };
  }, []);

  const setEngine = useCallback((id: SearchEngineId) => {
    setEngineId(id);
    void persistPreferredSearchEngineId(
      (nextId) => browser.storage.local.set({ [STORAGE_KEYS.preferredSearchEngine]: nextId }),
      id,
    );
  }, []);

  const engine = SEARCH_ENGINES.find((e) => e.id === engineId) ?? SEARCH_ENGINES[0];

  return { engine, engineId, setEngine };
}
