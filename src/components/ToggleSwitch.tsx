import { motion } from 'framer-motion';
import { COLOR_MAP } from '../types';
import type { HabitColor } from '../types';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  color?: HabitColor;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ToggleSwitch = ({
  checked,
  onChange,
  color = 'teal',
  label,
  size = 'md',
}: ToggleSwitchProps) => {
  const c = COLOR_MAP[color] ?? COLOR_MAP.teal;
  const dims =
    size === 'lg' ? { w: 64, h: 34, knob: 26 } : size === 'sm' ? { w: 40, h: 22, knob: 16 } : { w: 52, h: 28, knob: 22 };
  const { w, h, knob } = dims;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? 'Toggle habit completion'}
      onClick={onChange}
      className="focus-ring relative shrink-0 rounded-full transition-colors duration-300"
      style={{
        width: w,
        height: h,
        background: checked ? c.hex : 'rgba(136,146,176,0.22)',
        boxShadow: checked ? `0 0 14px ${c.glow}` : 'inset 0 1px 2px rgba(0,0,0,0.3)',
      }}
    >
      <motion.span
        layout
        className="absolute top-1/2 rounded-full bg-white shadow-md"
        style={{
          width: knob,
          height: knob,
          marginLeft: 3,
          boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
        }}
        initial={false}
        animate={{ x: checked ? w - knob - 6 : 0, y: '-50%' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
};