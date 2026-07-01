import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  getWeekDays,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  isSameDay,
  dayCompletion,
  formatWeekRange,
  formatDayNum,
  currentStreak,
} from '../utils/date';
import { COLOR_MAP } from '../types';
import type { Habit } from '../types';
import { ProgressRing } from './ProgressRing';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeekView = () => {
  const habits = useStore((s) => s.habits);
  const checkIns = useStore((s) => s.checkIns);
  const toggle = useStore((s) => s.toggle);

  const [refDate, setRefDate] = useState(new Date());
  const week = getWeekDays(refDate);
  const today = new Date();

  const active = habits.filter((h) => !h.archived);

  const weekRate = useMemo(() => {
    const start = startOfWeek(refDate, { weekStartsOn: 1 });
    const end = endOfWeek(refDate, { weekStartsOn: 1 });
    let done = 0;
    let total = 0;
    let cursor = start;
    while (cursor <= end && cursor <= today) {
      const r = dayCompletion(habits, checkIns, cursor);
      done += r.done;
      total += r.total;
      cursor = addDays(cursor, 1);
    }
    return total ? done / total : 0;
  }, [habits, checkIns, refDate, today]);

  const cellColor = (habit: Habit, date: Date) => {
    const { done, total } = dayCompletion([habit], checkIns, date);
    if (!isHabitDue(habit, date)) return 'rgba(136,146,176,0.06)';
    if (done === 0) return 'rgba(136,146,176,0.12)';
    const c = COLOR_MAP[habit.color];
    const intensity = 0.25 + 0.75 * Math.min(1, done);
    return `${c.hex}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
  };

  const goWeek = (dir: number) => {
    setRefDate((d) => addDays(d, dir * 7));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Week controls + summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card mb-6 flex flex-col gap-6 rounded-3xl p-6 md:flex-row md:items-center md:p-8"
      >
        <ProgressRing
          progress={weekRate}
          size={120}
          stroke={10}
          status={weekRate >= 0.8 ? 'success' : weekRate >= 0.5 ? 'warning' : 'danger'}
          label={`${Math.round(weekRate * 100)}%`}
          sublabel="week"
        />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary/70">
            Weekly Overview
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">
            <span className="gradient-text">{formatWeekRange(refDate)}</span>
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => goWeek(-1)}
              className="focus-ring press flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-ocean-800/50 text-secondary hover:text-primary"
              aria-label="Previous week"
            >
              ←
            </button>
            <button
              onClick={() => setRefDate(new Date())}
              className="focus-ring press rounded-xl border border-card-border bg-ocean-800/50 px-3 py-2 text-xs font-medium text-secondary hover:text-primary"
            >
              This Week
            </button>
            <button
              onClick={() => goWeek(1)}
              className="focus-ring press flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-ocean-800/50 text-secondary hover:text-primary"
              aria-label="Next week"
            >
              →
            </button>
          </div>
        </div>
      </motion.div>

      {/* Heatmap grid */}
      <div className="glass-card overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card/80 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary backdrop-blur">
                  Habit
                </th>
                {week.map((d, i) => {
                  const isToday = isSameDay(d, today);
                  const future = d > today;
                  return (
                    <th key={i} className="px-2 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary/70">
                          {DOW[i]}
                        </span>
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            isToday
                              ? 'bg-primary text-ocean-950'
                              : future
                              ? 'text-secondary/40'
                              : 'text-primary'
                          }`}
                        >
                          {formatDayNum(d)}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {active.map((h) => {
                const c = COLOR_MAP[h.color];
                const streak = currentStreak(h, checkIns, today);
                return (
                  <tr key={h.id} className="border-t border-card-border/40">
                    <td className="sticky left-0 z-10 bg-card/80 px-4 py-3 backdrop-blur">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: c.hex, boxShadow: `0 0 8px ${c.glow}` }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-primary">{h.name}</p>
                          <p className="text-[10px] text-secondary">
                            {streak}d streak · {h.target}×/wk
                          </p>
                        </div>
                      </div>
                    </td>
                    {week.map((d, i) => {
                      const { done, total } = dayCompletion([h], checkIns, d);
                      const isDone = done > 0;
                      const future = d > today;
                      const isToday = isSameDay(d, today);
                      return (
                        <td key={i} className="px-2 py-3 text-center">
                          <button
                            onClick={() => !future && toggle(h.id, d)}
                            disabled={future}
                            aria-label={`Toggle ${h.name} on ${DOW[i]}`}
                            className={`focus-ring group relative mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${
                              future
                                ? 'cursor-not-allowed'
                                : 'press hover:scale-105'
                            }`}
                            style={{
                              background: isDone ? cellColor(h, d) : 'rgba(136,146,176,0.06)',
                              border: isToday
                                ? `1.5px solid ${c.hex}`
                                : `1px solid ${isDone ? c.hex + '40' : 'transparent'}`,
                            }}
                          >
                            {isDone && (
                              <motion.span
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                className="text-sm font-bold"
                                style={{ color: '#0a192f' }}
                              >
                                ✓
                              </motion.span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function isHabitDue(_h: Habit, _d: Date): boolean {
  return true;
}