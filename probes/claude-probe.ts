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
    resets_at: z.string(),
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

        if (usage.five_hour) {
          data.session = {
            used: usage.five_hour.utilization / 100,
            resetAt: usage.five_hour.resets_at,
            label: 'Session (5h)',
          };
        }

        if (usage.seven_day) {
          data.weekly = {
            used: usage.seven_day.utilization / 100,
            resetAt: usage.seven_day.resets_at,
            label: 'Weekly',
          };
        }

        // Per-model usage
        const models: UsageData['models'] = [];
        if (usage.seven_day_sonnet) {
          models.push({
            model: 'Sonnet only',
            used: usage.seven_day_sonnet.utilization / 100,
            resetAt: usage.seven_day_sonnet.resets_at,
            tooltip:
              'Your Sonnet usage counts toward this limit, as well as your weekly and 5-hour session limits',
          });
        }
        if (usage.seven_day_opus) {
          models.push({
            model: 'Opus only',
            used: usage.seven_day_opus.utilization / 100,
            resetAt: usage.seven_day_opus.resets_at,
            tooltip:
              'Your Opus usage counts toward this limit, as well as your weekly and 5-hour session limits',
          });
        }
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
