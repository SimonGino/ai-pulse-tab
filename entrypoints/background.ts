import { claudeProbe } from '@/probes/claude-probe';
import { chatgptProbe } from '@/probes/chatgpt-probe';
import { ALARM_NAME, REFRESH_INTERVAL_MINUTES, STORAGE_KEYS, PROVIDERS } from '@/core/constants';
import type { UsageData } from '@/core/types';

const probeMap: Record<string, { probe: typeof claudeProbe; providerKey: string }> = {
  [PROVIDERS.claude.id]: { probe: claudeProbe, providerKey: 'claude' },
  [PROVIDERS.chatgpt.id]: { probe: chatgptProbe, providerKey: 'chatgpt' },
};

export default defineBackground(() => {
  // Read collapsed providers from storage
  async function getCollapsedProviders(): Promise<Record<string, boolean>> {
    const result = await browser.storage.local.get(STORAGE_KEYS.collapsedProviders);
    return (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
  }

  // Refresh a single provider and merge with cached data
  async function refreshProvider(providerId: string): Promise<void> {
    const entry = probeMap[providerId];
    if (!entry) return;

    console.log(`[AI Pulse Tab] Refreshing ${providerId}...`);

    const cached = await browser.storage.local.get(STORAGE_KEYS.usageData);
    const cachedData = (cached[STORAGE_KEYS.usageData] ?? []) as UsageData[];

    let freshData: UsageData[] | null = null;
    try {
      freshData = await entry.probe.fetchUsage();
    } catch {
      // keep cached on error
    }

    const otherData = cachedData.filter((d) => d.provider !== entry.providerKey);
    const thisData = freshData ?? cachedData.filter((d) => d.provider === entry.providerKey);
    const mergedData = [...otherData, ...thisData];

    if (mergedData.length > 0 || freshData !== null) {
      await browser.storage.local.set({
        [STORAGE_KEYS.usageData]: mergedData,
        [STORAGE_KEYS.lastUpdated]: Date.now(),
      });
      console.log(`[AI Pulse Tab] ${providerId} data updated`);
    }
  }

  // --- Multi-probe refresh (respects collapsed state) ---
  async function refreshUsage() {
    console.log('[AI Pulse Tab] Refreshing usage data...');

    const collapsedMap = await getCollapsedProviders();

    // Determine which providers to refresh (skip collapsed ones)
    const shouldRefreshClaude = !collapsedMap[PROVIDERS.claude.name];
    const shouldRefreshChatgpt = !collapsedMap[PROVIDERS.chatgpt.name];

    if (!shouldRefreshClaude && !shouldRefreshChatgpt) {
      console.log('[AI Pulse Tab] All providers collapsed, skipping refresh');
      return;
    }

    // Get cached data for fallback
    const cached = await browser.storage.local.get(STORAGE_KEYS.usageData);
    const cachedData = (cached[STORAGE_KEYS.usageData] ?? []) as UsageData[];

    const [claudeResult, chatgptResult] = await Promise.allSettled([
      shouldRefreshClaude ? claudeProbe.fetchUsage() : Promise.resolve(null),
      shouldRefreshChatgpt ? chatgptProbe.fetchUsage() : Promise.resolve(null),
    ]);

    const claudeData = claudeResult.status === 'fulfilled' ? claudeResult.value : null;
    const chatgptData = chatgptResult.status === 'fulfilled' ? chatgptResult.value : null;

    // Merge: use fresh data if available, otherwise keep cached data for that provider
    const mergedData: UsageData[] = [];

    if (claudeData) {
      mergedData.push(...claudeData);
    } else {
      // Keep cached: either skipped (collapsed) or probe failed
      mergedData.push(...cachedData.filter((d) => d.provider === 'claude'));
    }

    if (chatgptData) {
      mergedData.push(...chatgptData);
    } else {
      mergedData.push(...cachedData.filter((d) => d.provider === 'chatgpt'));
    }

    if (mergedData.length > 0 || claudeData !== null || chatgptData !== null) {
      await browser.storage.local.set({
        [STORAGE_KEYS.usageData]: mergedData,
        [STORAGE_KEYS.lastUpdated]: Date.now(),
      });
      console.log('[AI Pulse Tab] Usage data updated:', mergedData.length, 'entries');
    } else {
      console.log('[AI Pulse Tab] Both probes returned null, keeping cached data');
    }
  }

  // Create alarm on install/update and do first refresh
  browser.runtime.onInstalled.addListener(() => {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: REFRESH_INTERVAL_MINUTES,
    });
    refreshUsage();
  });

  // Also set up alarm on startup
  browser.runtime.onStartup.addListener(() => {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: REFRESH_INTERVAL_MINUTES,
    });
    refreshUsage();
  });

  // Handle alarm triggers
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      refreshUsage();
    }
  });

  // Handle manual refresh requests from New Tab
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'REFRESH_NOW') {
      refreshUsage().then(() => sendResponse({ ok: true }));
      return true; // async response
    }
    if (message?.type === 'REFRESH_PROVIDER' && message.providerId) {
      refreshProvider(message.providerId).then(() => sendResponse({ ok: true }));
      return true; // async response
    }
  });
});
