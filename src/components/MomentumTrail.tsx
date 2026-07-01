import { motion } from 'framer-motion';
import { COLOR_MAP } from '../types';
import type { HabitColor } from '../types';

interface MomentumTrailProps {
  streak: number;
  color: HabitColor;
  max?: number;
  compact?: boolean;
}

/** Milestone color tiers at 3 / 7 / 14 / 30 days. */
const tierColor = (streak: number, base: string): { color: string; glow: string } => {
  if (streak >= 30) return { color: '#fbbf24', glow: 'rgba(251,191,36,0.5)' }; // gold
  if (streak >= 14) return { color: '#a78bfa', glow: 'rgba(167,139,250,0.5)' }; // violet
  if (streak >= 7) return { color: '#64ffda', glow: 'rgba(100,255,218,0.5)' }; // teal
  if (streak >= 3) return { color: '#4caf50', glow: 'rgba(76,175,80,0.5)' }; // green
  return { color: base, glow: COLOR_MAP.amber.glow };
};

/**
 * Momentum trail: a horizontal trail of segments that grow with consecutive days.
 * Different colors at 3/7/14/30 day milestones. Animated growth.
 */
export const MomentumTrail = ({ streak, color, max = 30, compact = false }: MomentumTrailProps) => {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  const tier = tierColor(streak, c.hex);
  const filled = Math.min(streak, max);
  const segments = compact ? 14 : Math.min(max, 30);
  const segWidth = compact ? 4 : 6;
  const gap = compact ? 2 : 3;
  const segHeight = compact ? 14 : 22;

  return (
    <div className="flex flex-col gap-1" aria-label={`Momentum trail, ${streak} day streak`}>
      <div className="flex items-center gap-[3px]" style={{ gap }}>
        {Array.from({ length: segments }).map((_, i) => {
          const active = i < filled;
          const isMilestone = (i + 1) % 7 === 0 && active;
          return (
            <motion.div
              key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: active ? 1 : 0.25 }}
              transition={{
                duration: 0.35,
                delay: i * 0.018,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                width: segWidth,
                height: segHeight,
                borderRadius: 2,
                transformOrigin: 'left',
                background: active ? tier.color : 'rgba(136,146,176,0.18)',
                boxShadow: active
                  ? `0 0 ${isMilestone ? 8 : 5}px ${tier.glow}`
                  : 'none',
              }}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="flex items-center justify-between text-[10px] font-medium text-secondary">
          <span>{streak} day streak</span>
          <span style={{ color: tier.color }}>
            {streak >= 30 ? 'Legendary' : streak >= 14 ? 'On fire' : streak >= 7 ? 'Strong' : streak >= 3 ? 'Building' : 'Begin'}
          </span>
        </div>
      )}
    </div>
  );
};