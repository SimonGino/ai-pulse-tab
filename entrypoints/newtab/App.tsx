import { useEffect, useState } from 'react';
import { useUsageData } from '@/hooks/useUsageData';
import { ProviderCard } from '@/components/ProviderCard';
import { BookmarkGrid } from '@/components/BookmarkGrid';
import { TodoList } from '@/components/TodoList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PROVIDERS } from '@/core/constants';

function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(date: Date): string {
  return (
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
    '  \u00b7  ' +
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  );
}

function Greeting() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="greeting">
      <div className="time">{formatTime(now)}</div>
      <h1>
        {getGreeting()}, <span>ready to build?</span>
      </h1>
    </div>
  );
}

function EmptyProviderCard({ providerName, loginUrl, color }: { providerName: string; loginUrl: string; color: string }) {
  return (
    <div className="u-card">
      <div className="u-head">
        <div className="u-dot" style={{ background: color }} />
        <div className="u-brand">{providerName}</div>
      </div>
      <div style={{ fontSize: '10px', color: 'var(--t3)', fontStyle: 'italic' }}>
        <a href={loginUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--t2)', textDecoration: 'none' }}>
          Login to see usage →
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const { data, lastUpdated } = useUsageData();

  const claudeData = data.filter((d) => d.provider === PROVIDERS.claude.id);
  const chatgptData = data.filter((d) => d.provider === PROVIDERS.chatgpt.id);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Greeting />
        <ThemeToggle />
      </div>

      <div className="main">
        {/* Left: Usage Column */}
        <div className="usage-col">
          <div className="slabel">AI usage</div>

          {claudeData.length > 0 ? (
            <ProviderCard
              providerName={PROVIDERS.claude.name}
              providerId={PROVIDERS.claude.id}
              usageDataList={claudeData}
              loginUrl={PROVIDERS.claude.baseUrl}
              color={PROVIDERS.claude.color}
              lastUpdated={lastUpdated}
            />
          ) : (
            <EmptyProviderCard
              providerName={PROVIDERS.claude.name}
              loginUrl={PROVIDERS.claude.baseUrl}
              color={PROVIDERS.claude.color}
            />
          )}

          {chatgptData.length > 0 ? (
            <ProviderCard
              providerName={PROVIDERS.chatgpt.name}
              providerId={PROVIDERS.chatgpt.id}
              usageDataList={chatgptData}
              loginUrl={PROVIDERS.chatgpt.baseUrl}
              color={PROVIDERS.chatgpt.color}
              lastUpdated={lastUpdated}
            />
          ) : (
            <EmptyProviderCard
              providerName={PROVIDERS.chatgpt.name}
              loginUrl={PROVIDERS.chatgpt.baseUrl}
              color={PROVIDERS.chatgpt.color}
            />
          )}
        </div>

        {/* Right: Speed Dial + Todo */}
        <div className="right-col">
          <BookmarkGrid />
          <TodoList />
        </div>
      </div>
    </>
  );
}
