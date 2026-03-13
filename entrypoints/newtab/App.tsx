import { useState } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
import { BookmarkGrid } from '@/components/BookmarkGrid';
import { PacmanDecoration } from '@/components/PacmanDecoration';
import { SearchBar } from '@/components/SearchBar';
import { PROVIDERS } from '@/core/constants';

function formatRelativeTime(ts: number): string {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function App() {
  const { data, lastUpdated, refresh } = useUsageData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  const claudeData = data.filter((d) => d.provider === PROVIDERS.claude.id);
  const chatgptData = data.filter((d) => d.provider === PROVIDERS.chatgpt.id);
  const hasAnyData = claudeData.length > 0 || chatgptData.length > 0;

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center p-8"
      style={{ backgroundColor: 'var(--pixel-black)' }}
    >
      <h1
        className="pixel-font text-lg mb-6"
        style={{ color: 'var(--pixel-yellow)', letterSpacing: '2px' }}
      >
        AI Pulse Tab
      </h1>

      <SearchBar />

      <div className="dashboard-grid w-full" style={{ maxWidth: '1200px' }}>
        {/* Left column: Provider cards */}
        <div className="dashboard-providers flex flex-col gap-4">
          <h3
            className="pixel-font text-xs"
            style={{ color: 'var(--pixel-pink)', fontSize: '9px' }}
          >
            USAGES
          </h3>
          {!hasAnyData && (
            <div className="text-center space-y-2">
              <p className="pixel-font text-xs" style={{ color: 'var(--pixel-white)' }}>
                NOT LOGGED IN
              </p>
              <p className="pixel-font text-xs" style={{ color: 'var(--pixel-gray)' }}>
                Login to your AI providers to see usage
              </p>
            </div>
          )}

          {claudeData.length > 0 && (
            <ProviderCard
              providerName={PROVIDERS.claude.name}
              providerId={PROVIDERS.claude.id}
              usageDataList={claudeData}
              loginUrl={PROVIDERS.claude.baseUrl}
              color={PROVIDERS.claude.color}
            />
          )}

          {chatgptData.length > 0 && (
            <ProviderCard
              providerName={PROVIDERS.chatgpt.name}
              providerId={PROVIDERS.chatgpt.id}
              usageDataList={chatgptData}
              loginUrl={PROVIDERS.chatgpt.baseUrl}
              color={PROVIDERS.chatgpt.color}
            />
          )}
        </div>

        {/* Right column: Bookmarks */}
        <div className="dashboard-bookmarks">
          <BookmarkGrid />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs mt-6">
        {lastUpdated > 0 && (
          <span className="pixel-font" style={{ fontSize: '8px', color: 'var(--pixel-gray)' }}>
            Last updated: {formatRelativeTime(lastUpdated)}
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
