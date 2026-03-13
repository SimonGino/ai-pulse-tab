import { useState } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
import { QuickLinks } from '@/components/QuickLinks';
import { PacmanDecoration } from '@/components/PacmanDecoration';
import { PROVIDERS } from '@/core/constants';

function formatRelativeTime(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  return `${Math.floor(diff / 3600)} 小时前`;
}

export default function App() {
  const { data, lastUpdated, refresh } = useUsageData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      // Give storage a moment to update, then clear loading
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  const claudeData = data.filter((d) => d.provider === PROVIDERS.claude.id);
  const hasData = claudeData.length > 0;
  const isNotLoggedIn =
    !hasData ||
    claudeData.every((d) => d.authStatus.status !== 'authenticated');

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center p-8 gap-6"
      style={{ backgroundColor: 'var(--pixel-black)' }}
    >
      <h1
        className="pixel-font text-lg"
        style={{ color: 'var(--pixel-yellow)', letterSpacing: '2px' }}
      >
        AI Pulse Tab
      </h1>

      {!hasData && !isNotLoggedIn && (
        <p className="pixel-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
          LOADING...
        </p>
      )}

      {isNotLoggedIn && !hasData && (
        <div className="text-center space-y-2">
          <p className="pixel-font text-xs" style={{ color: 'var(--pixel-white)' }}>
            NOT LOGGED IN
          </p>
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-font text-xs"
            style={{ color: 'var(--pixel-cyan)' }}
          >
            LOGIN claude.ai →
          </a>
        </div>
      )}

      {hasData && (
        <ProviderCard
          providerName={PROVIDERS.claude.name}
          color={PROVIDERS.claude.color}
          usageDataList={claudeData}
        />
      )}

      <QuickLinks />

      <div className="flex items-center gap-3 text-xs">
        {lastUpdated > 0 && (
          <span className="pixel-font" style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}>
            最后更新: {formatRelativeTime(lastUpdated)}
          </span>
        )}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="pixel-btn"
        >
          {refreshing ? 'LOADING...' : 'REFRESH'}
        </button>
      </div>

      <PacmanDecoration />
    </div>
  );
}
