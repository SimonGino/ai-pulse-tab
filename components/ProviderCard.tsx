import { useCallback, useEffect, useRef, useState } from 'react';
import { updateCollapsedProvidersMap } from '@/core/bookmark-utils';
import type { UsageData } from '@/core/types';
import { STORAGE_KEYS } from '@/core/constants';
import { QuotaBar } from './QuotaBar';
import { ResetCountdown } from './ResetCountdown';

interface ProviderCardProps {
  providerName: string;
  providerId: string;
  usageDataList: UsageData[];
  loginUrl?: string;
  color?: string;
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
          style={{ color: 'var(--pixel-cyan)' }}
        >
          LOGIN →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.plan && (
        <p className="pixel-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
          Plan: {data.plan}
        </p>
      )}
      {data.warning && (
        <p className="pixel-font text-xs" style={{ color: 'var(--pixel-red)' }}>
          {data.warning}
        </p>
      )}
      {data.session && (
        <div>
          <QuotaBar
            used={data.session.used}
            label={data.session.label ?? 'Session'}
          />
          {data.session.resetAt && (
            <ResetCountdown resetAt={data.session.resetAt} />
          )}
        </div>
      )}
      {data.weekly && (
        <div>
          <QuotaBar
            used={data.weekly.used}
            label={data.weekly.label ?? 'Weekly'}
          />
          {data.weekly.resetAt && (
            <ResetCountdown resetAt={data.weekly.resetAt} />
          )}
        </div>
      )}
      {data.models?.map((m) => (
        <div key={m.model}>
          <QuotaBar used={m.used} label={m.model} tooltip={m.tooltip} />
          {m.resetAt && <ResetCountdown resetAt={m.resetAt} />}
        </div>
      ))}
      {data.extra && (
        <p className="pixel-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
          Extra: ${data.extra.spent.toFixed(2)} / ${data.extra.limit.toFixed(2)}
        </p>
      )}
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
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;
  const indicatorColor = color ?? 'var(--pixel-yellow)';
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <div
      className="pixel-border p-5 w-full"
      style={{ backgroundColor: 'var(--pixel-dark)' }}
    >
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        style={{ marginBottom: collapsed ? 0 : '12px' }}
        onClick={toggleCollapse}
      >
        <div
          className="w-3 h-3"
          style={{ backgroundColor: indicatorColor }}
        />
        <h2
          className="pixel-font text-sm flex-1"
          style={{ color: indicatorColor }}
        >
          {providerName}
        </h2>
        {collapsed && (
          <span className="pixel-font" style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}>
            Peak: {getHighestUsage(usageDataList)}
          </span>
        )}
        <span
          className="pixel-font"
          style={{ fontSize: '10px', color: 'var(--pixel-gray)', lineHeight: 1 }}
        >
          {collapsed ? '▶' : '▼'}
        </span>
      </div>

      {!collapsed && (
        isSingleOrg ? (
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
                  className="pixel-font text-xs mb-2"
                  style={{ color: 'var(--pixel-white)' }}
                >
                  {data.orgName}
                </p>
                <OrgCard data={data} loginUrl={loginUrl} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
