import { SEARCH_ENGINES, STORAGE_KEYS } from './constants.ts';
import type { SearchEngineId } from './types.ts';

type ErrorLogger = (message?: unknown, ...optionalParams: unknown[]) => void;

const SEARCH_ENGINE_IDS = new Set<SearchEngineId>(
  SEARCH_ENGINES.map((engine) => engine.id),
);

export function isSearchEngineId(value: unknown): value is SearchEngineId {
  return typeof value === 'string' && SEARCH_ENGINE_IDS.has(value as SearchEngineId);
}

export async function loadPreferredSearchEngineId(
  load: () => Promise<Record<string, unknown>>,
  fallback: SearchEngineId,
  logError: ErrorLogger = console.error,
): Promise<SearchEngineId> {
  try {
    const result = await load();
    const stored = result[STORAGE_KEYS.preferredSearchEngine];
    return isSearchEngineId(stored) ? stored : fallback;
  } catch (error) {
    logError('Failed to retrieve search engine preference:', error);
    return fallback;
  }
}

export async function persistPreferredSearchEngineId(
  save: (engineId: SearchEngineId) => Promise<unknown>,
  engineId: SearchEngineId,
  logError: ErrorLogger = console.error,
): Promise<void> {
  try {
    await save(engineId);
  } catch (error) {
    logError('Failed to persist search engine preference:', error);
  }
}
