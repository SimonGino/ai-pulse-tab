import test from 'node:test';
import assert from 'node:assert/strict';

import {
  loadPreferredSearchEngineId,
  persistPreferredSearchEngineId,
} from '../core/search-engine-utils.ts';

test('loadPreferredSearchEngineId returns the stored engine when it is valid', async () => {
  const engineId = await loadPreferredSearchEngineId(
    async () => ({ preferredSearchEngine: 'duckduckgo' }),
    'google',
    () => {},
  );

  assert.equal(engineId, 'duckduckgo');
});

test('loadPreferredSearchEngineId falls back when storage contains an invalid engine id', async () => {
  const engineId = await loadPreferredSearchEngineId(
    async () => ({ preferredSearchEngine: 'askjeeves' }),
    'google',
    () => {},
  );

  assert.equal(engineId, 'google');
});

test('loadPreferredSearchEngineId logs and falls back when storage retrieval fails', async () => {
  const errors: unknown[][] = [];

  const engineId = await loadPreferredSearchEngineId(
    async () => {
      throw new Error('storage exploded');
    },
    'google',
    (...args: unknown[]) => errors.push(args),
  );

  assert.equal(engineId, 'google');
  assert.equal(errors.length, 1);
  assert.equal(errors[0][0], 'Failed to retrieve search engine preference:');
  assert.match(String(errors[0][1]), /storage exploded/);
});

test('persistPreferredSearchEngineId logs storage write failures instead of rejecting', async () => {
  const errors: unknown[][] = [];

  await persistPreferredSearchEngineId(
    async () => {
      throw new Error('cannot save');
    },
    'bing',
    (...args: unknown[]) => errors.push(args),
  );

  assert.equal(errors.length, 1);
  assert.equal(errors[0][0], 'Failed to persist search engine preference:');
  assert.match(String(errors[0][1]), /cannot save/);
});
