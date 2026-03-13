export const REFRESH_INTERVAL_MINUTES = 5;
export const ALARM_NAME = 'refresh-usage';

export const QUOTA_THRESHOLDS = {
  low: 0.5,
  high: 0.8,
} as const;

export const PROVIDERS = {
  claude: {
    id: 'claude',
    name: 'Claude',
    color: '#D97706',
    baseUrl: 'https://claude.ai',
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    color: '#10A37F',
    baseUrl: 'https://chatgpt.com',
  },
} as const;

export const STORAGE_KEYS = {
  usageData: 'usageData',
  lastUpdated: 'lastUpdated',
} as const;
