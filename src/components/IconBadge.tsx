import { motion } from 'framer-motion';
import { COLOR_MAP, HABIT_ICONS } from '../types';
import type { HabitColor } from '../types';

interface IconBadgeProps {
  icon: string;
  color: HabitColor;
  size?: number;
  animateHover?: boolean;
}

export const IconBadge = ({ icon, color, size = 44, animateHover = true }: IconBadgeProps) => {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  const glyph = HABIT_ICONS[icon] ?? '✓';

  return (
    <motion.div
      whileHover={animateHover ? { scale: 1.08, rotate: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: c.soft,
        border: `1px solid ${c.hex}33`,
        boxShadow: `inset 0 0 12px ${c.glow}`,
        fontSize: size * 0.46,
      }}
      aria-hidden="true"
    >
      <span style={{ filter: 'saturate(1.1)' }}>{glyph}</span>
    </motion.div>
  );
};