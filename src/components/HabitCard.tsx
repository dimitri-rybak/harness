import { motion } from 'framer-motion';
import { IconBadge } from './IconBadge';
import { ToggleSwitch } from './ToggleSwitch';
import { ProgressRing } from './ProgressRing';
import { MomentumTrail } from './MomentumTrail';
import { COLOR_MAP } from '../types';
import type { Habit, CheckInMap } from '../types';
import {
  currentStreak,
  weeklyRate,
  isCompleted,
  streakStatus,
  type StreakStatus,
} from '../utils/date';

interface HabitCardProps {
  habit: Habit;
  checkIns: CheckInMap;
  date: Date;
  categoryName?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const HabitCard = ({
  habit,
  checkIns,
  date,
  categoryName,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) => {
  const c = COLOR_MAP[habit.color] ?? COLOR_MAP.teal;
  const done = isCompleted(checkIns, habit.id, date);
  const streak = currentStreak(habit, checkIns, date);
  const rate = weeklyRate(habit, checkIns, date);
  const status: StreakStatus = done ? 'success' : streakStatus(streak, habit.target);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card glass-card-hover group relative overflow-hidden rounded-2xl p-5"
      style={{ borderLeft: `3px solid ${c.hex}` }}
    >
      {/* soft glow accent */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-3xl"
        style={{ background: c.glow }}
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-4">
        <IconBadge icon={habit.icon} color={habit.color} size={48} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-lg font-bold text-primary">{habit.name}</h3>
            {categoryName && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: c.soft, color: c.hex }}
              >
                {categoryName}
              </span>
            )}
          </div>
          {habit.description && (
            <p className="mt-0.5 truncate text-xs text-secondary">{habit.description}</p>
          )}
          <p className="mt-1 text-[11px] font-medium text-secondary/70">
            {habit.target}× per {habit.frequency === 'daily' ? 'day' : 'week'}
          </p>
        </div>

        <ToggleSwitch checked={done} onChange={onToggle} color={habit.color} label={`Toggle ${habit.name}`} />
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-4">
        <MomentumTrail streak={streak} color={habit.color} compact />
        <ProgressRing
          progress={rate}
          size={62}
          stroke={6}
          status={status}
          label={streak}
          sublabel={done ? 'done' : 'streak'}
        />
      </div>

      {/* action menu on hover */}
      <div className="relative mt-3 flex items-center justify-end gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={onEdit}
          className="focus-ring press rounded-lg px-2 py-1 text-xs font-medium text-secondary hover:bg-card-light hover:text-primary"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="focus-ring press rounded-lg px-2 py-1 text-xs font-medium text-secondary hover:bg-danger/15 hover:text-danger"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
};