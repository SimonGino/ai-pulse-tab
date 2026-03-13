import { claudeProbe } from '@/probes/claude-probe';
import { chatgptProbe } from '@/probes/chatgpt-probe';
import { ALARM_NAME, REFRESH_INTERVAL_MINUTES, STORAGE_KEYS } from '@/core/constants';
import type { UsageData } from '@/core/types';

export default defineBackground(() => {
  // --- Multi-probe refresh ---
  async function refreshUsage() {
    console.log('[AI Pulse Tab] Refreshing usage data...');

    // Get cached data for fallback
    const cached = await browser.storage.local.get(STORAGE_KEYS.usageData);
    const cachedData: UsageData[] = cached[STORAGE_KEYS.usageData] ?? [];

    const [claudeResult, chatgptResult] = await Promise.allSettled([
      claudeProbe.fetchUsage(),
      chatgptProbe.fetchUsage(),
    ]);

    const claudeData = claudeResult.status === 'fulfilled' ? claudeResult.value : null;
    const chatgptData = chatgptResult.status === 'fulfilled' ? chatgptResult.value : null;

    // Merge: use fresh data if available, otherwise keep cached data for that provider
    const mergedData: UsageData[] = [];

    if (claudeData) {
      mergedData.push(...claudeData);
    } else {
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
  });
});
