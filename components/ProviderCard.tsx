import type { UsageData } from '@/core/types';
import { QuotaBar } from './QuotaBar';
import { ResetCountdown } from './ResetCountdown';

interface ProviderCardProps {
  providerName: string;
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

export function ProviderCard({
  providerName,
  usageDataList,
  loginUrl,
  color,
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;
  const indicatorColor = color ?? 'var(--pixel-yellow)';

  return (
    <div
      className="pixel-border p-5 w-full max-w-sm"
      style={{ backgroundColor: 'var(--pixel-dark)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3"
          style={{ backgroundColor: indicatorColor }}
        />
        <h2
          className="pixel-font text-sm"
          style={{ color: indicatorColor }}
        >
          {providerName}
        </h2>
      </div>

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
                className="pixel-font text-xs mb-2"
                style={{ color: 'var(--pixel-white)' }}
              >
                {data.orgName}
              </p>
              <OrgCard data={data} loginUrl={loginUrl} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
