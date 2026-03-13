import { z } from 'zod';
import type { AuthStatus, UsageData, UsageProbe } from '@/core/types';
import { PROVIDERS } from '@/core/constants';

// --- Zod schemas matching real Claude API responses ---

const OrganizationSchema = z
  .object({
    uuid: z.string(),
    name: z.string().optional().default(''),
  })
  .passthrough();

const OrganizationsResponseSchema = z.array(OrganizationSchema);

const QuotaWindowSchema = z
  .object({
    utilization: z.number(),
    resets_at: z.string().nullable().optional(),
  })
  .nullable();

const ExtraUsageSchema = z
  .object({
    is_enabled: z.boolean().optional(),
    monthly_limit: z.number().nullable().optional(),
    used_credits: z.number().nullable().optional(),
    utilization: z.number().nullable().optional(),
  })
  .nullable()
  .optional();

const UsageResponseSchema = z
  .object({
    five_hour: QuotaWindowSchema.optional(),
    seven_day: QuotaWindowSchema.optional(),
    seven_day_opus: QuotaWindowSchema.optional(),
    seven_day_sonnet: QuotaWindowSchema.optional(),
    seven_day_oauth_apps: QuotaWindowSchema.optional(),
    seven_day_cowork: QuotaWindowSchema.optional(),
    extra_usage: ExtraUsageSchema,
  })
  .passthrough();

// --- ClaudeProbe ---

const BASE_URL = PROVIDERS.claude.baseUrl;

type QuotaWindow = NonNullable<z.infer<typeof QuotaWindowSchema>>;

function normalizeQuotaWindow(
  quota: QuotaWindow | null | undefined,
  label: string,
): UsageData['session'] | undefined {
  if (!quota) {
    return undefined;
  }

  return {
    used: quota.utilization / 100,
    label,
    ...(quota.resets_at ? { resetAt: quota.resets_at } : {}),
  };
}

function normalizeModelUsage(
  quota: QuotaWindow | null | undefined,
  model: string,
  tooltip: string,
) {
  if (!quota) {
    return null;
  }

  return {
    model,
    used: quota.utilization / 100,
    tooltip,
    ...(quota.resets_at ? { resetAt: quota.resets_at } : {}),
  };
}

export const claudeProbe: UsageProbe = {
  id: PROVIDERS.claude.id,
  name: PROVIDERS.claude.name,
  color: PROVIDERS.claude.color,

  async checkAuth(): Promise<AuthStatus> {
    try {
      const orgs = await fetchOrganizations();
      if (!orgs.length) {
        return { status: 'expired', message: '请重新登录 claude.ai' };
      }
      return {
        status: 'authenticated',
        account: orgs[0].name || 'Personal',
      };
    } catch {
      return { status: 'not_logged_in' };
    }
  },

  async fetchUsage(): Promise<UsageData[] | null> {
    let orgs: z.infer<typeof OrganizationsResponseSchema>;
    try {
      orgs = await fetchOrganizations();
    } catch (err) {
      console.error('[ClaudeProbe] fetchOrganizations failed:', err);
      return null;
    }

    if (!orgs.length) return null;

    const results: UsageData[] = [];

    for (const org of orgs) {
      try {
        const usage = await fetchUsageAPI(org.uuid);

        const data: UsageData = {
          provider: PROVIDERS.claude.id,
          orgId: org.uuid,
          orgName: org.name || 'Personal',
          fetchedAt: Date.now(),
          authStatus: {
            status: 'authenticated',
            account: org.name || 'Personal',
          },
        };

        data.session = normalizeQuotaWindow(usage.five_hour, 'Session (5h)');
        data.weekly = normalizeQuotaWindow(usage.seven_day, 'Weekly');

        // Per-model usage
        const models: UsageData['models'] = [];
        const sonnetUsage = normalizeModelUsage(
          usage.seven_day_sonnet,
          'Sonnet only',
          'Your Sonnet usage counts toward this limit, as well as your weekly and 5-hour session limits',
        );
        if (sonnetUsage) models.push(sonnetUsage);

        const opusUsage = normalizeModelUsage(
          usage.seven_day_opus,
          'Opus only',
          'Your Opus usage counts toward this limit, as well as your weekly and 5-hour session limits',
        );
        if (opusUsage) models.push(opusUsage);
        if (models.length > 0) {
          data.models = models;
        }

        // Extra usage (from the same response, not a separate endpoint)
        const extra = usage.extra_usage;
        if (
          extra?.is_enabled &&
          extra.used_credits != null &&
          extra.monthly_limit != null
        ) {
          data.extra = {
            spent: extra.used_credits,
            limit: extra.monthly_limit,
            currency: 'USD',
          };
        }

        results.push(data);
      } catch (err) {
        console.warn('[ClaudeProbe] Error processing org', org.name, err);
      }
    }

    return results.length > 0 ? results : null;
  },
};

async function fetchOrganizations() {
  const res = await fetch(`${BASE_URL}/api/organizations`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return OrganizationsResponseSchema.parse(json);
}

async function fetchUsageAPI(orgId: string) {
  const res = await fetch(`${BASE_URL}/api/organizations/${orgId}/usage`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return UsageResponseSchema.parse(json);
}
