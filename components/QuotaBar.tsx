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
        <span className="data-font flex items-center gap-1" style={{ fontSize: '11px' }}>
          {label}
          {tooltip && (
            <span className="relative group cursor-help">
              <span
                className="data-font inline-flex items-center justify-center w-3.5 h-3.5"
                style={{
                  fontSize: '9px',
                  border: '1px solid var(--pixel-gray)',
                  color: 'var(--pixel-gray)',
                }}
              >
                ?
              </span>
              <span
                className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-80 px-3 py-2 text-xs leading-normal z-10 data-font"
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
        <span className="data-font font-medium" style={{ fontSize: '11px' }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div className="flex gap-[1px]">
        {Array.from({ length: TOTAL_BLOCKS }, (_, i) => (
          <div
            key={i}
            style={{
              width: '100%',
              height: '16px',
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
