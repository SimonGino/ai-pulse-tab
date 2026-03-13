import { z } from 'zod';
import type { AuthStatus, UsageData, UsageProbe } from '@/core/types';
import { PROVIDERS } from '@/core/constants';

// --- Zod schemas for ChatGPT API responses ---

const SessionSchema = z.object({
  accessToken: z.string().optional(),
}).passthrough();

const AccountSchema = z.object({
  plan_type: z.string(),
  name: z.string().nullable().optional(),
}).passthrough();

const EntitlementSchema = z.object({
  has_active_subscription: z.boolean().optional(),
}).passthrough();

const AccountEntrySchema = z.object({
  account: AccountSchema,
  entitlement: EntitlementSchema.optional(),
}).passthrough();

const AccountsCheckSchema = z.object({
  accounts: z.record(z.string(), AccountEntrySchema),
}).passthrough();

// --- wham/usage API schemas ---

const WindowSnapshotSchema = z.object({
  used_percent: z.number(),
  reset_at: z.number(),
  limit_window_seconds: z.number(),
}).nullable().optional();

const RateLimitSchema = z.object({
  primary_window: WindowSnapshotSchema,
  secondary_window: WindowSnapshotSchema,
}).nullable().optional();

const CreditsSchema = z.object({
  has_credits: z.boolean().optional(),
  unlimited: z.boolean().optional(),
  balance: z.number().nullable().optional(),
}).nullable().optional();

const WhamUsageSchema = z.object({
  plan_type: z.string().optional(),
  rate_limit: RateLimitSchema,
  credits: CreditsSchema,
}).passthrough();

// --- Model slug mapping (still needed for webRequest interceptor) ---

export function mapModelSlug(slug: string): string {
  if (!slug) return 'gpt-5';

  const s = slug.toLowerCase();
  if (s === 'auto') return 'auto';
  if (s.includes('gpt-5-pro')) return 'gpt-5-pro';
  if (s.includes('gpt-5-thinking')) return 'gpt-5-thinking';
  if (s.includes('o3') || s.includes('o4')) return 'gpt-5-thinking';
  if (s.includes('gpt-5') || s.includes('gpt-4o') || s.includes('chatgpt-4o')) return 'gpt-5';
  return 'gpt-5';
}

// --- Plan type normalization ---

function normalizePlanType(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('pro')) return 'pro';
  if (s.includes('team')) return 'team';
  if (s.includes('plus')) return 'plus';
  return 'free';
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatWindowLabel(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 24) return `${hours}h`;
  const days = hours / 24;
  if (days === 7) return 'Weekly';
  if (days === 14) return '2 Weeks';
  return `${days}d`;
}

// --- Auth helpers ---

async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('https://chatgpt.com/api/auth/session', {
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = SessionSchema.parse(await res.json());
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

async function fetchAccountsCheck(token: string) {
  const res = await fetch(
    'https://chatgpt.com/backend-api/accounts/check/v4-2023-04-27',
    {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return AccountsCheckSchema.parse(json);
}

async function fetchWhamUsage(token: string, accountId?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
  if (accountId) {
    headers['ChatGPT-Account-Id'] = accountId;
  }
  const res = await fetch(
    'https://chatgpt.com/backend-api/wham/usage',
    {
      credentials: 'include',
      headers,
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return WhamUsageSchema.parse(json);
}

// --- ChatGPT Probe ---

export const chatgptProbe: UsageProbe = {
  id: PROVIDERS.chatgpt.id,
  name: PROVIDERS.chatgpt.name,
  color: PROVIDERS.chatgpt.color,

  async checkAuth(): Promise<AuthStatus> {
    const token = await getAccessToken();
    if (token === null) {
      return { status: 'not_logged_in' };
    }

    try {
      const check = await fetchAccountsCheck(token);
      const accountIds = Object.keys(check.accounts).filter((k) => k !== 'default');
      if (accountIds.length === 0) {
        return { status: 'not_logged_in' };
      }
      const entry = check.accounts[accountIds[0]];
      return {
        status: 'authenticated',
        account: entry.account.name ?? capitalizeFirst(normalizePlanType(entry.account.plan_type)),
      };
    } catch {
      return { status: 'not_logged_in' };
    }
  },

  async fetchUsage(): Promise<UsageData[] | null> {
    const token = await getAccessToken();
    if (!token) return null;

    let check: z.infer<typeof AccountsCheckSchema>;
    try {
      check = await fetchAccountsCheck(token);
    } catch (err) {
      console.error('[ChatGPTProbe] fetchAccountsCheck failed:', err);
      return null;
    }

    const accountIds = Object.keys(check.accounts).filter((k) => k !== 'default');
    if (accountIds.length === 0) return null;

    const results: UsageData[] = [];

    for (const accountId of accountIds) {
      const entry = check.accounts[accountId];
      const planType = normalizePlanType(entry.account.plan_type);

      const data: UsageData = {
        provider: PROVIDERS.chatgpt.id,
        orgId: accountId,
        orgName: entry.account.name ?? capitalizeFirst(planType),
        fetchedAt: Date.now(),
        authStatus: {
          status: 'authenticated',
          account: entry.account.name ?? capitalizeFirst(planType),
        },
        plan: capitalizeFirst(planType),
      };

      // Only fetch wham/usage for paid plans — free accounts have no server-side rate limit data
      if (planType !== 'free') {
        try {
          const whamData = await fetchWhamUsage(token, accountId);
          console.log('[ChatGPTProbe] wham/usage for', accountId, ':', JSON.stringify(whamData));

          const rateLimit = whamData?.rate_limit;
          if (rateLimit?.primary_window) {
            const w = rateLimit.primary_window;
            data.session = {
              used: w.used_percent / 100,
              label: formatWindowLabel(w.limit_window_seconds),
              resetAt: new Date(w.reset_at * 1000).toISOString(),
            };
          }
          if (rateLimit?.secondary_window) {
            const w = rateLimit.secondary_window;
            data.weekly = {
              used: w.used_percent / 100,
              label: formatWindowLabel(w.limit_window_seconds),
              resetAt: new Date(w.reset_at * 1000).toISOString(),
            };
          }
        } catch (err) {
          console.warn('[ChatGPTProbe] wham/usage failed for', accountId, err);
        }
      }

      results.push(data);
    }

    return results.length > 0 ? results : null;
  },
};
