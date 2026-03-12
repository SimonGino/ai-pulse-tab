import { useState } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-2xl font-bold text-gray-200">AI Pulse Tab</h1>

      {!hasData && !isNotLoggedIn && (
        <p className="text-gray-500">加载中...</p>
      )}

      {isNotLoggedIn && !hasData && (
        <div className="text-center space-y-2">
          <p className="text-gray-400">未检测到登录状态</p>
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm"
          >
            请先登录 claude.ai →
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

      <div className="flex items-center gap-3 text-xs text-gray-500">
        {lastUpdated > 0 && (
          <span>最后更新: {formatRelativeTime(lastUpdated)}</span>
        )}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 disabled:opacity-50 transition-colors text-gray-300"
        >
          {refreshing ? '刷新中...' : '⟳ 刷新'}
        </button>
      </div>
    </div>
  );
}
