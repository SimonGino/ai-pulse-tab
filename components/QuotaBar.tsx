import { QUOTA_THRESHOLDS } from '@/core/constants';

interface QuotaBarProps {
  used: number; // 0-1
  label: string;
  tooltip?: string;
}

function getColor(used: number): string {
  if (used >= QUOTA_THRESHOLDS.high) return 'bg-red-500';
  if (used >= QUOTA_THRESHOLDS.low) return 'bg-orange-400';
  return 'bg-emerald-500';
}

export function QuotaBar({ used, label, tooltip }: QuotaBarProps) {
  const pct = Math.min(Math.max(used, 0), 1) * 100;
  const color = getColor(used);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          {label}
          {tooltip && (
            <span className="relative group cursor-help">
              <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-[10px] text-gray-500">
                i
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-52 px-2.5 py-1.5 rounded-md bg-gray-700 text-gray-200 text-[11px] leading-snug shadow-lg z-10">
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
