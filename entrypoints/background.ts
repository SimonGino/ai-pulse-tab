import { claudeProbe } from '@/probes/claude-probe';
import { ALARM_NAME, REFRESH_INTERVAL_MINUTES, STORAGE_KEYS } from '@/core/constants';

export default defineBackground(() => {
  async function refreshUsage() {
    console.log('[AI Pulse Tab] Refreshing usage data...');
    try {
      const usageData = await claudeProbe.fetchUsage();
      if (usageData) {
        await browser.storage.local.set({
          [STORAGE_KEYS.usageData]: usageData,
          [STORAGE_KEYS.lastUpdated]: Date.now(),
        });
        console.log('[AI Pulse Tab] Usage data updated', usageData.length, 'orgs');
      } else {
        console.log('[AI Pulse Tab] Probe returned null, keeping cached data');
      }
    } catch (err) {
      console.error('[AI Pulse Tab] Refresh failed, keeping cached data', err);
    }
  }

  // Create alarm on install/update and do first refresh
  browser.runtime.onInstalled.addListener(() => {
    browser.alarms.create(ALARM_NAME, {
      periodInMinutes: REFRESH_INTERVAL_MINUTES,
    });
    refreshUsage();
  });

  // Also set up alarm on startup (in case it was lost)
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
