import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { updateCollapsedProvidersMap } from '@/core/bookmark-utils';
import type { UsageData } from '@/core/types';
import { STORAGE_KEYS } from '@/core/constants';
import { QuotaBar } from './QuotaBar';
import { ResetCountdown } from './ResetCountdown';

function formatRelativeTime(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface ProviderCardProps {
  providerName: string;
  providerId: string;
  usageDataList: UsageData[];
  loginUrl?: string;
  color?: string;
  lastUpdated?: number;
}

function OrgCard({ data, loginUrl, brandColor, showPlan = true }: { data: UsageData; loginUrl?: string; brandColor: string; showPlan?: boolean }) {
  if (data.authStatus.status !== 'authenticated') {
    const url = loginUrl ?? '#';
    return (
      <div style={{ fontSize: '10px', color: 'var(--t3)', fontStyle: 'italic' }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t2)', textDecoration: 'none' }}>
          {data.authStatus.status === 'expired' ? 'Session expired — re-login →' : 'Login to see usage →'}
        </a>
      </div>
    );
  }

  const sections: ReactNode[] = [];

  if (data.plan && showPlan) {
    sections.push(
      <span key="plan" className="u-plan">{data.plan}</span>
    );
  }
  if (data.warning) {
    sections.push(
      <div key="warning" style={{ fontSize: '10px', color: 'var(--danger)' }}>{data.warning}</div>
    );
  }
  if (data.session) {
    sections.push(
      <div key="session">
        <QuotaBar used={data.session.used} label={data.session.label ?? 'Session'} brandColor={brandColor} />
        {data.session.resetAt && <ResetCountdown resetAt={data.session.resetAt} />}
      </div>
    );
  }
  if (data.weekly) {
    sections.push(
      <div key="weekly">
        <QuotaBar used={data.weekly.used} label={data.weekly.label ?? 'Weekly'} brandColor={brandColor} />
        {data.weekly.resetAt && <ResetCountdown resetAt={data.weekly.resetAt} />}
      </div>
    );
  }
  if (data.daily) {
    sections.push(
      <div key="daily">
        <QuotaBar used={data.daily.used} label={data.daily.label ?? 'Daily'} brandColor={brandColor} />
        {data.daily.resetAt && <ResetCountdown resetAt={data.daily.resetAt} />}
      </div>
    );
  }
  if (data.models) {
    for (const m of data.models) {
      sections.push(
        <div key={m.model}>
          <QuotaBar used={m.used} label={m.model} brandColor={brandColor} tooltip={m.tooltip} />
          {m.resetAt && <ResetCountdown resetAt={m.resetAt} />}
        </div>
      );
    }
  }
  if (data.extra) {
    sections.push(
      <div key="extra" style={{ fontSize: '9px', fontFamily: "'Space Mono', monospace", color: 'var(--t3)' }}>
        Extra: ${data.extra.spent.toFixed(2)} / ${data.extra.limit.toFixed(2)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {sections}
    </div>
  );
}

function getHighestUsage(dataList: UsageData[]): string {
  let max = 0;
  for (const d of dataList) {
    if (d.session) max = Math.max(max, d.session.used);
    if (d.weekly) max = Math.max(max, d.weekly.used);
    if (d.daily) max = Math.max(max, d.daily.used);
    if (d.models) {
      for (const m of d.models) max = Math.max(max, m.used);
    }
  }
  return `${Math.round(max * 100)}%`;
}

export function ProviderCard({
  providerName,
  providerId,
  usageDataList,
  loginUrl,
  color,
  lastUpdated,
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;
  const [collapsed, setCollapsed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const collapsedRef = useRef(false);
  const persistQueueRef = useRef<Promise<void>>(Promise.resolve());
  const brandColor = color ? `var(--${providerId === 'claude' ? 'claude' : 'gpt'})` : 'var(--t2)';

  useEffect(() => {
    let active = true;

    browser.storage.local
      .get(STORAGE_KEYS.collapsedProviders)
      .then((result: Record<string, unknown>) => {
        if (!active) return;
        const map = (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
        const storedCollapsed = Boolean(map[providerName]);
        collapsedRef.current = storedCollapsed;
        setCollapsed(storedCollapsed);
      });

    return () => { active = false; };
  }, [providerName]);

  const persistCollapsedState = useCallback(
    (next: boolean) => {
      persistQueueRef.current = persistQueueRef.current
        .then(async () => {
          const result = await browser.storage.local.get(STORAGE_KEYS.collapsedProviders);
          const map = (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
          await browser.storage.local.set({
            [STORAGE_KEYS.collapsedProviders]: updateCollapsedProvidersMap(map, providerName, next),
          });
        })
        .catch((error: unknown) => {
          console.error('Failed to persist collapsed provider state', error);
        });

      return persistQueueRef.current;
    },
    [providerName],
  );

  const toggleCollapse = () => {
    const next = !collapsedRef.current;
    collapsedRef.current = next;
    setCollapsed(next);
    void persistCollapsedState(next);
    if (!next) {
      void browser.runtime.sendMessage({ type: 'REFRESH_PROVIDER', providerId });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        browser.runtime.sendMessage({ type: 'REFRESH_PROVIDER', providerId }),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="u-card">
      <div className="u-head" style={{ marginBottom: collapsed ? 0 : '8px' }}>
        <div className="u-dot" style={{ background: color }} />
        <div className="u-brand">{providerName}</div>
        {collapsed && (
          <span className="u-ago">Peak: {getHighestUsage(usageDataList)}</span>
        )}
        <button className="collapse-btn" onClick={toggleCollapse}>
          {collapsed ? '▶' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <>
          {isSingleOrg ? (
            <OrgCard data={usageDataList[0]} loginUrl={loginUrl} brandColor={brandColor} />
          ) : (
            <div>
              {usageDataList.map((data, i) => (
                <div key={data.orgId}>
                  {i > 0 && <div className="u-sep" />}
                  <div className="u-org">{data.orgName}</div>
                  {data.plan && <div className="u-org-plan">Plan: {data.plan}</div>}
                  <OrgCard data={data} loginUrl={loginUrl} brandColor={brandColor} showPlan={false} />
                </div>
              ))}
            </div>
          )}

          <div className="u-foot">
            <button className="u-refresh" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? '...' : 'Refresh'}
            </button>
            {lastUpdated != null && lastUpdated > 0 && (
              <span className="u-ago">{formatRelativeTime(lastUpdated)}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
