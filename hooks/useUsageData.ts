import { useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/core/constants';
import type { UsageData } from '@/core/types';

export function useUsageData() {
  const [data, setData] = useState<UsageData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  useEffect(() => {
    // Load cached data
    browser.storage.local
      .get([STORAGE_KEYS.usageData, STORAGE_KEYS.lastUpdated])
      .then((result: Record<string, unknown>) => {
        if (result[STORAGE_KEYS.usageData]) {
          setData(result[STORAGE_KEYS.usageData] as UsageData[]);
        }
        if (result[STORAGE_KEYS.lastUpdated]) {
          setLastUpdated(result[STORAGE_KEYS.lastUpdated] as number);
        }
      });

    // Listen for updates
    const listener = (changes: Record<string, { newValue?: unknown }>) => {
      if (changes[STORAGE_KEYS.usageData]?.newValue) {
        setData(changes[STORAGE_KEYS.usageData].newValue as UsageData[]);
      }
      if (changes[STORAGE_KEYS.lastUpdated]?.newValue != null) {
        setLastUpdated(changes[STORAGE_KEYS.lastUpdated].newValue as number);
      }
    };
    browser.storage.local.onChanged.addListener(listener);
    return () => browser.storage.local.onChanged.removeListener(listener);
  }, []);

  const refresh = () => {
    return browser.runtime.sendMessage({ type: 'REFRESH_NOW' });
  };

  return { data, lastUpdated, refresh };
}
