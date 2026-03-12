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
      <div className="rounded-lg bg-gray-800/50 p-3">
        <p className="text-sm text-gray-400">
          {data.authStatus.status === 'expired'
            ? '请重新登录 claude.ai'
            : '请登录 claude.ai'}
        </p>
        <a
          href="https://claude.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline mt-1 inline-block"
        >
          去登录 →
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
        <p className="text-xs text-gray-500">
          Extra: ${data.extra.spent.toFixed(2)} / ${data.extra.limit.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export function ProviderCard({
  providerName,
  color,
  usageDataList,
}: ProviderCardProps) {
  const isSingleOrg = usageDataList.length === 1;

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 w-full max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        <h2 className="text-lg font-semibold">{providerName}</h2>
      </div>

      {isSingleOrg ? (
        <OrgCard data={usageDataList[0]} />
      ) : (
        <div className="space-y-3">
          {usageDataList.map((data) => (
            <div key={data.orgId} className="rounded-lg bg-gray-800/50 p-3">
              <p className="text-xs font-medium text-gray-300 mb-2">
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
