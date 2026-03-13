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

export const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', urlTemplate: 'https://www.google.com/search?q={query}', icon: 'G' },
  { id: 'bing', name: 'Bing', urlTemplate: 'https://www.bing.com/search?q={query}', icon: 'B' },
  { id: 'duckduckgo', name: 'DuckDuckGo', urlTemplate: 'https://duckduckgo.com/?q={query}', icon: 'D' },
  { id: 'perplexity', name: 'Perplexity', urlTemplate: 'https://www.perplexity.ai/search?q={query}', icon: 'P' },
] as const;

export const STORAGE_KEYS = {
  usageData: 'usageData',
  lastUpdated: 'lastUpdated',
  bookmarks: 'bookmarks',
  collapsedProviders: 'collapsedProviders',
  preferredSearchEngine: 'preferredSearchEngine',
} as const;

export const BOOKMARK_COLORS = [
  '#D97706', // amber
  '#10A37F', // green
  '#FF6A00', // orange
  '#FFFFFF', // white
  '#ff0000', // red
  '#ffb8ff', // pink
  '#00ffff', // cyan
  '#2121de', // blue
  '#ffff00', // yellow
  '#00ff00', // green-bright
] as const;

export const DEFAULT_BOOKMARKS = [
  { id: 'default-1', name: 'Claude', url: 'https://claude.ai', letter: 'C', color: '#D97706', order: 0 },
  { id: 'default-2', name: 'ChatGPT', url: 'https://chatgpt.com', letter: 'G', color: '#10A37F', order: 1 },
  { id: 'default-3', name: 'Gemini', url: 'https://gemini.google.com', letter: 'G', color: '#FF6A00', order: 2 },
  { id: 'default-4', name: 'GitHub', url: 'https://github.com', letter: 'G', color: '#FFFFFF', order: 3 },
  { id: 'default-5', name: 'X', url: 'https://x.com', letter: 'X', color: '#00ffff', order: 4 },
] as const;
