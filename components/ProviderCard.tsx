import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { updateCollapsedProvidersMap } from '@/core/bookmark-utils';
import type { UsageData } from '@/core/types';
import { STORAGE_KEYS } from '@/core/constants';
import {
  getOrgCardSectionContainerClassName,
  getOrgCardSectionContentMarginTop,
} from './provider-card-layout';
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

function OrgCard({ data, loginUrl }: { data: UsageData; loginUrl?: string }) {
  if (data.authStatus.status !== 'authenticated') {
    const url = loginUrl ?? 'https://claude.ai';
    return (
      <div
        className="p-3"
        style={{ backgroundColor: 'var(--pixel-dark)' }}
      >
        <p className="text-sm" style={{ color: 'var(--pixel-white)' }}>
          {data.authStatus.status === 'expired'
            ? `Please re-login to ${url}`
            : `Please login to ${url}`}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-font text-xs mt-1 inline-block"
          style={{ color: 'var(--pixel-white)' }}
        >
          LOGIN →
        </a>
      </div>
    );
  }

  const divider = (
    <div style={{ height: '1px', backgroundColor: 'var(--pixel-border)', opacity: 0.5 }} />
  );

  const sections: ReactNode[] = [];

  if (data.plan) {
    sections.push(
      <p key="plan" className="data-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
        Plan: {data.plan}
      </p>
    );
  }
  if (data.warning) {
    sections.push(
      <p key="warning" className="data-font text-xs" style={{ color: 'var(--pixel-red)' }}>
        {data.warning}
      </p>
    );
  }
  if (data.session) {
    sections.push(
      <div key="session">
        <QuotaBar used={data.session.used} label={data.session.label ?? 'Session'} />
        {data.session.resetAt && <ResetCountdown resetAt={data.session.resetAt} />}
      </div>
    );
  }
  if (data.weekly) {
    sections.push(
      <div key="weekly">
        <QuotaBar used={data.weekly.used} label={data.weekly.label ?? 'Weekly'} />
        {data.weekly.resetAt && <ResetCountdown resetAt={data.weekly.resetAt} />}
      </div>
    );
  }
  if (data.models) {
    for (const m of data.models) {
      sections.push(
        <div key={m.model}>
          <QuotaBar used={m.used} label={m.model} tooltip={m.tooltip} />
          {m.resetAt && <ResetCountdown resetAt={m.resetAt} />}
        </div>
      );
    }
  }
  if (data.extra) {
    sections.push(
      <p key="extra" className="data-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
        Extra: ${data.extra.spent.toFixed(2)} / ${data.extra.limit.toFixed(2)}
      </p>
    );
  }

  return (
    <div className={getOrgCardSectionContainerClassName()}>
      {sections.map((section, i) => (
        <div key={i}>
          {i > 0 && divider}
          <div style={{ marginTop: getOrgCardSectionContentMarginTop(i) }}>{section}</div>
        </div>
      ))}
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

  useEffect(() => {
    let active = true;

    browser.storage.local
      .get(STORAGE_KEYS.collapsedProviders)
      .then((result: Record<string, unknown>) => {
        if (!active) {
          return;
        }

        const map = (result[STORAGE_KEYS.collapsedProviders] ?? {}) as Record<string, boolean>;
        const storedCollapsed = Boolean(map[providerName]);
        collapsedRef.current = storedCollapsed;
        setCollapsed(storedCollapsed);
      });

    return () => {
      active = false;
    };
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

    // When expanding a collapsed provider, trigger immediate refresh
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
    <div
      className="pixel-border p-5 w-full"
      style={{ backgroundColor: 'var(--pixel-dark)' }}
    >
      <div
        className="flex items-center gap-2 select-none"
        style={{ marginBottom: collapsed ? 0 : '12px' }}
      >
        <a
          href={loginUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pixel-font text-sm flex-1"
          style={{ color: 'var(--pixel-white)', textDecoration: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          {providerName}
        </a>
        {collapsed && (
          <span className="data-font" style={{ fontSize: '10px', color: 'var(--pixel-gray)' }}>
            Peak: {getHighestUsage(usageDataList)}
          </span>
        )}
        <button
          onClick={toggleCollapse}
          className="pixel-font cursor-pointer"
          style={{
            fontSize: '10px',
            color: 'var(--pixel-gray)',
            lineHeight: 1,
            background: 'none',
            border: 'none',
            padding: '4px 8px',
          }}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <>
          {isSingleOrg ? (
            <OrgCard data={usageDataList[0]} loginUrl={loginUrl} />
          ) : (
            <div className="space-y-3">
              {usageDataList.map((data) => (
                <div
                  key={data.orgId}
                  className="p-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <p
                    className="data-font text-xs mb-2 font-medium"
                    style={{ color: 'var(--pixel-white)' }}
                  >
                    {data.orgName}
                  </p>
                  <OrgCard data={data} loginUrl={loginUrl} />
                </div>
              ))}
            </div>
          )}

          {/* Per-card refresh */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="pixel-btn"
              style={{ fontSize: '8px', padding: '4px 10px' }}
            >
              {refreshing ? '...' : 'REFRESH'}
            </button>
            {lastUpdated != null && lastUpdated > 0 && (
              <span className="data-font" style={{ fontSize: '9px', color: 'var(--pixel-reset-text)' }}>
                {formatRelativeTime(lastUpdated)}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
