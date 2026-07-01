import { motion } from 'framer-motion';
import type { StreakStatus } from '../utils/date';
import { statusColor } from '../utils/date';

interface ProgressRingProps {
  /** 0..1 progress */
  progress: number;
  size?: number;
  stroke?: number;
  status?: StreakStatus;
  colorOverride?: string;
  label?: string | number;
  sublabel?: string;
  glow?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const ProgressRing = ({
  progress,
  size = 88,
  stroke = 8,
  status,
  colorOverride,
  label,
  sublabel,
  glow = true,
}: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);
  const color = colorOverride ?? (status ? statusColor(status) : '#64ffda');

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={sublabel ?? `${Math.round(clamped * 100)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(136,146,176,0.15)"
          strokeWidth={stroke}
        />
        {/* progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-grad-${color.replace('#', '')})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: EASE }}
          style={glow ? { filter: `drop-shadow(0 0 6px ${color}66)` } : undefined}
        />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold leading-none"
            style={{ color, fontSize: size * 0.26 }}
          >
            {label}
          </span>
          {sublabel && (
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-secondary">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};