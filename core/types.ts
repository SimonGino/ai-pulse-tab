export interface UsageProbe {
  id: string;
  name: string;
  color: string;
  checkAuth(): Promise<AuthStatus>;
  fetchUsage(): Promise<UsageData[] | null>;
}

export type AuthStatus =
  | { status: 'authenticated'; account: string }
  | { status: 'expired'; message: string }
  | { status: 'not_logged_in' };

export interface UsageData {
  provider: string;
  orgId: string;
  orgName: string;
  fetchedAt: number;
  authStatus: AuthStatus;
  session?: QuotaWindow;
  weekly?: QuotaWindow;
  daily?: QuotaWindow;
  models?: ModelUsage[];
  extra?: {
    spent: number;
    limit: number;
    currency: string;
  };
  plan?: string;
  warning?: string;
}

export interface QuotaWindow {
  used: number; // 0-1
  resetAt?: string; // ISO string, omitted when provider does not return it
  label?: string;
}

export interface ModelUsage {
  model: string;
  used: number; // 0-1
  resetAt?: string; // ISO string
  tooltip?: string;
}

export interface Bookmark {
  id: string;
  name: string;
  url: string;
  letter: string;
  color: string;
  order: number;
}

export type SearchEngineId = 'google' | 'bing' | 'duckduckgo' | 'perplexity';

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  urlTemplate: string;
  icon: string;
}
