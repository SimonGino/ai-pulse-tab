import { QUOTA_THRESHOLDS } from '@/core/constants';

interface QuotaBarProps {
  used: number; // 0-1
  label: string;
  brandColor: string; // CSS value, e.g. "var(--claude)"
  tooltip?: string;
}

const TOTAL_SEGMENTS = 16;

// Returns the fill color for filled segments only.
// When used === 0, no segments are filled so this is not called.
function getSegmentFillColor(used: number, brandColor: string): string {
  if (used >= QUOTA_THRESHOLDS.high) return 'var(--danger)';
  if (used >= QUOTA_THRESHOLDS.low) return 'var(--warn)';
  return brandColor;
}

// Note: pct-ok always renders green (var(--gpt)) for the normal range,
// matching the prototype's behavior.
function getPctClass(used: number): string {
  if (used === 0) return 'pct-lo';
  if (used < QUOTA_THRESHOLDS.low) return 'pct-ok';
  if (used < QUOTA_THRESHOLDS.high) return 'pct-w';
  return 'pct-d';
}

export function QuotaBar({ used, label, brandColor, tooltip }: QuotaBarProps) {
  const pct = Math.round(Math.min(Math.max(used, 0), 1) * 100);
  const filled = Math.round(used * TOTAL_SEGMENTS);
  const fillColor = getSegmentFillColor(used, brandColor);

  return (
    <div className="u-row">
      <div className="u-row-top">
        <span className="u-row-label">
          {label}
          {tooltip && (
            <span className="relative group cursor-help ml-1">
              <span
                className="inline-flex items-center justify-center w-3 h-3"
                style={{ fontSize: '8px', border: '1px solid var(--t3)', borderRadius: '2px', color: 'var(--t3)' }}
              >
                ?
              </span>
              <span
                className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block w-64 px-2 py-1.5 text-xs leading-normal z-10"
                style={{ background: 'var(--bg)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rs)', color: 'var(--t2)', fontSize: '9px' }}
              >
                {tooltip}
              </span>
            </span>
          )}
        </span>
        <span className={`u-row-pct ${getPctClass(used)}`}>{pct}%</span>
      </div>
      <div className="seg-bar">
        {Array.from({ length: TOTAL_SEGMENTS }, (_, i) => (
          <div
            key={i}
            className={`seg ${i < filled ? '' : 'empty'}`}
            style={i < filled ? { background: fillColor, flex: 1 } : { flex: 1 }}
          />
        ))}
      </div>
    </div>
  );
}
