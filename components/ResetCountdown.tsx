import { useEffect, useState } from 'react';

interface ResetCountdownProps {
  resetAt: string; // ISO string
}

function formatCountdown(resetAt: string): string {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return '重置中...';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function ResetCountdown({ resetAt }: ResetCountdownProps) {
  const [text, setText] = useState(() => formatCountdown(resetAt));

  useEffect(() => {
    setText(formatCountdown(resetAt));
    const timer = setInterval(() => {
      setText(formatCountdown(resetAt));
    }, 60_000);
    return () => clearInterval(timer);
  }, [resetAt]);

  return <span className="text-xs text-gray-500">重置: {text}</span>;
}
