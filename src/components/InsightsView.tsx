import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import {
  getWeekDays,
  dayCompletion,
  currentStreak,
  longestStreak,
  startOfWeek,
  addDays,
  format,
  isSameDay,
  formatPretty,
} from '../utils/date';
import { COLOR_MAP } from '../types';
import type { HabitColor } from '../types';
import { ProgressRing } from './ProgressRing';
import type { StreakStatus } from '../utils/date';

export const InsightsView = () => {
  const habits = useStore((s) => s.habits);
  const categories = useStore((s) => s.categories);
  const checkIns = useStore((s) => s.checkIns);

  const today = new Date();
  const active = habits.filter((h) => !h.archived);

  // last 7 days completion trend
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(today, -(6 - i));
      const { done, total } = dayCompletion(habits, checkIns, d);
      return { date: d, rate: total ? done / total : 0, done, total };
    });
  }, [habits, checkIns, today]);

  // weekly total
  const weekTotal = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    let done = 0;
    let total = 0;
    let cursor = start;
    while (cursor <= today) {
      const r = dayCompletion(habits, checkIns, cursor);
      done += r.done;
      total += r.total;
      cursor = addDays(cursor, 1);
    }
    return { done, total, rate: total ? done / total : 0 };
  }, [habits, checkIns, today]);

  // best/worst day in last 7
  const { best, worst } = useMemo(() => {
    let best = last7[0];
    let worst = last7[0];
    for (const d of last7) {
      if (d.rate > best.rate) best = d;
      if (d.rate < worst.rate) worst = d;
    }
    return { best, worst };
  }, [last7]);

  // category breakdown
  const byCategory = useMemo(() => {
    const map = new Map<string, { done: number; total: number; count: number }>();
    for (const h of active) {
      const key = h.categoryId ?? 'uncat';
      const cur = map.get(key) ?? { done: 0, total: 0, count: 0 };
      cur.count++;
      // count completions over last 30 days
      for (let i = 0; i < 30; i++) {
        const d = addDays(today, -i);
        const day = checkIns[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`];
        cur.total++;
        if (day?.[h.id]) cur.done++;
      }
      map.set(key, cur);
    }
    return [...map.entries()].map(([id, v]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        name: cat?.name ?? 'Uncategorized',
        color: (cat?.color ?? 'teal') as HabitColor,
        ...v,
        rate: v.total ? v.done / v.total : 0,
      };
    });
  }, [active, categories, checkIns, today]);

  const status: StreakStatus = weekTotal.rate >= 0.8 ? 'success' : weekTotal.rate >= 0.5 ? 'warning' : 'danger';

  const maxBarHeight = 140;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      {/* Header summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card mb-6 flex flex-col gap-6 rounded-3xl p-6 md:flex-row md:items-center md:p-8"
      >
        <ProgressRing
          progress={weekTotal.rate}
          size={120}
          stroke={10}
          status={status}
          label={`${Math.round(weekTotal.rate * 100)}%`}
          sublabel="this week"
        />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-secondary/70">Insights</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">
            <span className="gradient-text">Your momentum, quantified.</span>
          </h2>
          <p className="mt-1 text-sm text-secondary">
            {weekTotal.done} of {weekTotal.total} check-ins this week.
          </p>
        </div>
      </motion.div>

      {/* 7-day trend bar chart */}
      <div className="glass-card mb-6 rounded-3xl p-6 md:p-8">
        <h3 className="mb-1 font-display text-xl font-bold text-primary">7-Day Completion Trend</h3>
        <p className="mb-6 text-xs text-secondary">Daily completion rate over the past week</p>
        <div className="flex items-end justify-between gap-3" style={{ height: maxBarHeight + 50 }}>
          {last7.map((d, i) => {
            const isToday = isSameDay(d.date, today);
            const h = Math.max(4, d.rate * maxBarHeight);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-primary">
                  {d.total ? Math.round(d.rate * 100) : '—'}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[40px] rounded-t-lg"
                  style={{
                    background: isToday
                      ? 'linear-gradient(180deg, #64ffda, #00b8a4)'
                      : d.rate >= 0.5
                      ? 'linear-gradient(180deg, #4caf50, #2e7d32)'
                      : d.rate > 0
                      ? 'linear-gradient(180deg, #ff9800, #e65100)'
                      : 'rgba(136,146,176,0.25)',
                    boxShadow: isToday ? '0 0 16px rgba(100,255,218,0.4)' : 'none',
                  }}
                />
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase text-secondary/70">
                    {format(d.date, 'EEE')}
                  </p>
                  <p className={`text-[11px] font-bold ${isToday ? 'text-primary' : 'text-secondary'}`}>
                    {format(d.date, 'd')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Best/worst day */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h3 className="mb-4 font-display text-xl font-bold text-primary">Best & Hardest Day</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-card-border bg-ocean-800/40 p-4">
              <div className="text-3xl">🏆</div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-success">Best Day</p>
                <p className="font-display text-lg font-bold text-primary">{formatPretty(best.date)}</p>
                <p className="text-xs text-secondary">
                  {best.done}/{best.total} habits · {Math.round(best.rate * 100)}% complete
                </p>
              </div>
              <ProgressRing progress={best.rate} size={48} stroke={5} status="success" />
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-card-border bg-ocean-800/40 p-4">
              <div className="text-3xl">⚡</div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-warning">Hardest Day</p>
                <p className="font-display text-lg font-bold text-primary">{formatPretty(worst.date)}</p>
                <p className="text-xs text-secondary">
                  {worst.done}/{worst.total} habits · {Math.round(worst.rate * 100)}% complete
                </p>
              </div>
              <ProgressRing progress={worst.rate} size={48} stroke={5} status="warning" />
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <h3 className="mb-4 font-display text-xl font-bold text-primary">By Category (30d)</h3>
          <div className="space-y-3">
            {byCategory.map((c) => {
              const col = COLOR_MAP[c.color] ?? COLOR_MAP.teal;
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-secondary">{c.name}</span>
                    <span className="font-bold" style={{ color: col.hex }}>
                      {Math.round(c.rate * 100)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ocean-600/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.rate * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: col.hex, boxShadow: `0 0 8px ${col.glow}` }}
                    />
                  </div>
                </div>
              );
            })}
            {byCategory.length === 0 && (
              <p className="text-sm text-secondary">No data yet. Check in to see insights.</p>
            )}
          </div>
        </div>
      </div>

      {/* Streak leaderboard */}
      <div className="glass-card mt-6 rounded-3xl p-6 md:p-8">
        <h3 className="mb-4 font-display text-xl font-bold text-primary">Streak Leaderboard</h3>
        <div className="space-y-2">
          {active
            .map((h) => ({ h, cs: currentStreak(h, checkIns, today), ls: longestStreak(h, checkIns) }))
            .sort((a, b) => b.cs - a.cs)
            .map(({ h, cs, ls }, i) => {
              const c = COLOR_MAP[h.color];
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 rounded-xl border border-card-border bg-ocean-800/30 p-3"
                >
                  <span className="w-6 text-center font-display text-lg font-bold text-secondary">
                    #{i + 1}
                  </span>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ background: c.hex, boxShadow: `0 0 8px ${c.glow}` }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-primary">{h.name}</p>
                    <p className="text-[10px] text-secondary">Longest: {ls}d</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold" style={{ color: c.hex }}>
                      {cs}d
                    </p>
                    <p className="text-[10px] text-secondary">current</p>
                  </div>
                </motion.div>
              );
            })}
          {active.length === 0 && (
            <p className="text-sm text-secondary">No habits yet. Add one to start tracking streaks.</p>
          )}
        </div>
      </div>
    </div>
  );
};