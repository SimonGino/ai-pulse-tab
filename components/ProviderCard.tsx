import type { UsageData } from '@/core/types';
import { QuotaBar } from './QuotaBar';
import { ResetCountdown } from './ResetCountdown';

interface ProviderCardProps {
  providerName: string;
  color: string;
  usageDataList: UsageData[];
}

function OrgCard({ data }: { data: UsageData }) {
  if (data.authStatus.status !== 'authenticated') {
    return (
      <div
        className="p-3"
        style={{ backgroundColor: 'var(--pixel-dark)' }}
      >
        <p className="text-sm" style={{ color: 'var(--pixel-white)' }}>
          {data.authStatus.status === 'expired'
            ? '请重新登录 claude.ai'
            : '请登录 claude.ai'}
        </p>
        <a
          href="https://claude.ai"
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
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;

  return (
    <div
      className="pixel-border p-5 w-full max-w-sm"
      style={{ backgroundColor: 'var(--pixel-dark)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-3 h-3"
          style={{ backgroundColor: 'var(--pixel-yellow)' }}
        />
        <h2
          className="pixel-font text-sm"
          style={{ color: 'var(--pixel-yellow)' }}
        >
          {providerName}
        </h2>
      </div>

      {isSingleOrg ? (
        <OrgCard data={usageDataList[0]} />
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
              <OrgCard data={data} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
