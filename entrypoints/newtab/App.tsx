import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
import { BookmarkGrid } from '@/components/BookmarkGrid';
import { PROVIDERS } from '@/core/constants';

export default function App() {
  const { data, lastUpdated } = useUsageData();

  const claudeData = data.filter((d) => d.provider === PROVIDERS.claude.id);
  const chatgptData = data.filter((d) => d.provider === PROVIDERS.chatgpt.id);
  const hasAnyData = claudeData.length > 0 || chatgptData.length > 0;

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center px-8 py-4"
      style={{ backgroundColor: 'var(--pixel-black)' }}
    >
      <div className="dashboard-content">
        {/* Quota cards - visual hero when logged in */}
        {hasAnyData && (
          <div className="providers-grid">
            {claudeData.length > 0 && (
              <ProviderCard
                providerName={PROVIDERS.claude.name}
                providerId={PROVIDERS.claude.id}
                usageDataList={claudeData}
                loginUrl={PROVIDERS.claude.baseUrl}
                color={PROVIDERS.claude.color}
                lastUpdated={lastUpdated}
              />
            )}

            {chatgptData.length > 0 && (
              <ProviderCard
                providerName={PROVIDERS.chatgpt.name}
                providerId={PROVIDERS.chatgpt.id}
                usageDataList={chatgptData}
                loginUrl={PROVIDERS.chatgpt.baseUrl}
                color={PROVIDERS.chatgpt.color}
                lastUpdated={lastUpdated}
              />
            )}
          </div>
        )}

        {/* Not logged in hint */}
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

        <BookmarkGrid />
      </div>
    </div>
  );
}
