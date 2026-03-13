import { QUOTA_THRESHOLDS } from '@/core/constants';

interface QuotaBarProps {
  used: number; // 0-1
  label: string;
  tooltip?: string;
}

const TOTAL_BLOCKS = 10;

function getBlockColor(used: number): string {
  if (used >= QUOTA_THRESHOLDS.high) return 'var(--pixel-red)';
  if (used >= QUOTA_THRESHOLDS.low) return 'var(--pixel-orange)';
  return 'var(--pixel-green)';
}

export function QuotaBar({ used, label, tooltip }: QuotaBarProps) {
  const pct = Math.min(Math.max(used, 0), 1) * 100;
  const filledBlocks = Math.round(used * TOTAL_BLOCKS);
  const color = getBlockColor(used);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs" style={{ color: 'var(--pixel-white)' }}>
        <span className="pixel-font flex items-center gap-1" style={{ fontSize: '9px' }}>
          {label}
          {tooltip && (
            <span className="relative group cursor-help">
              <span
                className="pixel-font inline-flex items-center justify-center w-3.5 h-3.5"
                style={{
                  fontSize: '8px',
                  border: '1px solid var(--pixel-gray)',
                  color: 'var(--pixel-gray)',
                }}
              >
                ?
              </span>
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-52 px-2.5 py-1.5 text-[11px] leading-snug z-10"
                style={{
                  backgroundColor: 'var(--pixel-dark)',
                  color: 'var(--pixel-white)',
                  border: '2px solid var(--pixel-border)',
                }}
              >
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span className="pixel-font" style={{ fontSize: '9px' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="flex gap-[2px]">
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: '8px',
              backgroundColor:
                i < filledBlocks ? color : 'var(--pixel-gray)',
              opacity: i < filledBlocks ? 1 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
