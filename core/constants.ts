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
  bookmarks: 'bookmarks',
  collapsedProviders: 'collapsedProviders',
} as const;

export const DEFAULT_BOOKMARKS = [
  { id: 'default-1', name: 'Claude', url: 'https://claude.ai', order: 0 },
  { id: 'default-2', name: 'ChatGPT', url: 'https://chatgpt.com', order: 1 },
  { id: 'default-3', name: 'Google', url: 'https://www.google.com', order: 2 },
  { id: 'default-4', name: 'Gemini', url: 'https://gemini.google.com', order: 3 },
  { id: 'default-5', name: 'GitHub', url: 'https://github.com', order: 4 },
  { id: 'default-6', name: 'X', url: 'https://x.com', order: 5 },
] as const;
