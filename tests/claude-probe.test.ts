import test from 'node:test';
import assert from 'node:assert/strict';

import { claudeProbe } from '../probes/claude-probe.ts';

test('claudeProbe keeps valid org data when seven_day_sonnet.resets_at is null', async () => {
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;

  globalThis.fetch = async (input) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.endsWith('/api/organizations')) {
      return new Response(
        JSON.stringify([
          {
            uuid: 'org-personal',
            name: 'Personal',
          },
          {
            uuid: 'org-forbidden',
            name: 'Team',
          },
        ]),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (url.endsWith('/api/organizations/org-personal/usage')) {
      return new Response(
        JSON.stringify({
          five_hour: {
            utilization: 25,
            resets_at: '2026-03-13T12:00:00.000Z',
          },
          seven_day: {
            utilization: 50,
            resets_at: '2026-03-20T00:00:00.000Z',
          },
          seven_day_sonnet: {
            utilization: 75,
            resets_at: null,
          },
          extra_usage: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (url.endsWith('/api/organizations/org-forbidden/usage')) {
      return new Response('forbidden', { status: 403 });
    }

    throw new Error(`Unexpected fetch URL: ${url}`);
  };
  console.warn = () => {};

  try {
    const usageData = await claudeProbe.fetchUsage();

    assert.ok(usageData, 'expected fetchUsage to return data');
    assert.equal(usageData.length, 1);
    assert.equal(usageData[0].orgId, 'org-personal');
    assert.equal(usageData[0].session?.resetAt, '2026-03-13T12:00:00.000Z');
    assert.equal(usageData[0].models?.[0].model, 'Sonnet only');
    assert.equal(usageData[0].models?.[0].resetAt, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  }
});
