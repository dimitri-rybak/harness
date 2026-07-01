import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { HabitCard } from './HabitCard';
import { ProgressRing } from './ProgressRing';
import { useStore } from '../store/useStore';
import {
  dayCompletion,
  currentStreak,
  longestStreak,
  formatPretty,
  streakStatus,
  type StreakStatus,
} from '../utils/date';
import { COLOR_MAP } from '../types';

export const TodayView = ({ onAdd, onEdit }: { onAdd: () => void; onEdit: (id: string) => void }) => {
  const habits = useStore((s) => s.habits);
  const categories = useStore((s) => s.categories);
  const checkIns = useStore((s) => s.checkIns);
  const toggle = useStore((s) => s.toggle);
  const deleteHabit = useStore((s) => s.deleteHabit);
  const layoutOrder = useStore((s) => s.layoutOrder);

  const today = new Date();
  const active = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  );
  const ordered = useMemo(() => {
    if (layoutOrder.length) {
      const map = new Map(active.map((h) => [h.id, h]));
      const out = layoutOrder.map((id) => map.get(id)).filter(Boolean) as typeof active;
      // append any not in layoutOrder
      for (const h of active) if (!layoutOrder.includes(h.id)) out.push(h);
      return out;
    }
    return active;
  }, [active, layoutOrder]);

  const { done, total } = dayCompletion(habits, checkIns, today);
  const completion = total ? done / total : 0;
  const status: StreakStatus = completion >= 1 ? 'success' : completion >= 0.5 ? 'warning' : 'idle';

  const bestStreak = useMemo(() => {
    let best = { value: 0, habitId: '' };
    for (const h of active) {
      const cs = currentStreak(h, checkIns, today);
      if (cs > best.value) best = { value: cs, habitId: h.id };
    }
    return best;
  }, [active, checkIns]);

  const totalLongest = useMemo(
    () => active.reduce((m, h) => Math.max(m, longestStreak(h, checkIns)), 0),
    [active, checkIns]
  );

  if (active.length === 0) return null;

  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Summary hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card mb-6 flex flex-col items-center gap-6 rounded-3xl p-6 md:flex-row md:p-8"
      >
        <ProgressRing
          progress={completion}
          size={128}
          stroke={10}
          status={status}
          label={done}
          sublabel={`of ${total}`}
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary/70">
            {formatPretty(today)}
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold leading-tight md:text-4xl">
            <span className="gradient-text">{greeting}.</span>
          </h2>
          <p className="mt-1 text-sm text-secondary">
            {done === total && total > 0 ? (
              <>🎉 All done for today. Momentum locked in.</>
            ) : done === 0 ? (
              <>Tap the toggles below to start today's streak.</>
            ) : (
              <>
                {total - done} habit{total - done === 1 ? '' : 's'} left — keep the momentum going.
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
            <Stat label="Current Best" value={`${bestStreak.value}d`} color="#64ffda" />
            <Stat label="Longest Ever" value={`${totalLongest}d`} color="#a78bfa" />
            <Stat label="Total Habits" value={`${active.length}`} color="#4caf50" />
          </div>
        </div>
      </motion.div>

      {/* Habit grid */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-primary">Today's Habits</h3>
        <span className="text-xs text-secondary">{active.length} active</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {ordered.map((h) => {
            const cat = categories.find((c) => c.id === h.categoryId);
            return (
              <HabitCard
                key={h.id}
                habit={h}
                checkIns={checkIns}
                date={today}
                categoryName={cat?.name}
                onToggle={() => toggle(h.id, today)}
                onEdit={() => onEdit(h.id)}
                onDelete={() => {
                  if (confirm(`Delete "${h.name}"? This removes all its check-in data.`)) {
                    deleteHabit(h.id);
                  }
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div
    className="flex items-center gap-2 rounded-xl border border-card-border bg-ocean-800/40 px-3 py-2"
    style={{ borderColor: `${color}30` }}
  >
    <span
      className="h-2 w-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
    />
    <span className="text-xs font-medium text-secondary">{label}</span>
    <span className="font-display text-sm font-bold" style={{ color }}>
      {value}
    </span>
  </div>
);