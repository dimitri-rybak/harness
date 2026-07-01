import {
  format,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import type { Habit, CheckInMap } from '../types';

export const dateKey = (d: Date): string => format(d, 'yyyy-MM-dd');

export const todayKey = (): string => dateKey(new Date());

export const isHabitDueOn = (habit: Habit, date: Date): boolean => {
  // daily habits are due every day; weekly habits due every day too (target = times/week)
  return true;
};

export const getDayCheckIns = (checkIns: CheckInMap, date: Date): Record<string, boolean> => {
  const key = dateKey(date);
  return checkIns[key] ?? {};
};

export const isCompleted = (checkIns: CheckInMap, habitId: string, date: Date): boolean => {
  const day = getDayCheckIns(checkIns, date);
  return day[habitId] === true;
};

export const toggleCheckIn = (
  checkIns: CheckInMap,
  habitId: string,
  date: Date
): CheckInMap => {
  const key = dateKey(date);
  const day = { ...(checkIns[key] ?? {}) };
  if (day[habitId]) {
    delete day[habitId];
  } else {
    day[habitId] = true;
  }
  return { ...checkIns, [key]: day };
};

/**
 * Calculate current streak for a habit ending today (or given date).
 * Walks backwards day by day counting consecutive completed days.
 * For weekly habits with target < 7, counts weeks where target met — but
 * for simplicity and visual consistency, we count consecutive completed days
 * when the habit was due. Handles month boundaries and leap years via date-fns.
 */
export const currentStreak = (habit: Habit, checkIns: CheckInMap, end: Date = new Date()): number => {
  let streak = 0;
  let cursor = end;
  // walk backwards up to 2 years
  for (let i = 0; i < 730; i++) {
    if (isCompleted(checkIns, habit.id, cursor)) {
      streak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }
  return streak;
};

/**
 * Longest streak ever for a habit.
 */
export const longestStreak = (habit: Habit, checkIns: CheckInMap): number => {
  const created = parseISO(habit.createdAt);
  const today = new Date();
  let best = 0;
  let run = 0;
  let cursor = created;
  while (cursor <= today) {
    if (isCompleted(checkIns, habit.id, cursor)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    cursor = addDays(cursor, 1);
  }
  return best;
};

/**
 * Streak status based on streak length — drives ring color.
 */
export type StreakStatus = 'success' | 'warning' | 'danger' | 'idle';

export const streakStatus = (streak: number, target: number): StreakStatus => {
  const t = Math.max(target, 1);
  if (streak === 0) return 'idle';
  if (streak >= t * 3 || streak >= 14) return 'success';
  if (streak >= t) return 'success';
  if (streak >= Math.ceil(t / 2)) return 'warning';
  return 'danger';
};

export const statusColor = (status: StreakStatus): string => {
  switch (status) {
    case 'success':
      return '#4caf50';
    case 'warning':
      return '#ff9800';
    case 'danger':
      return '#f44336';
    default:
      return '#8892b0';
  }
};

/**
 * Weekly completion rate for a habit (0..1) for the week containing `date`.
 */
export const weeklyRate = (habit: Habit, checkIns: CheckInMap, ref: Date = new Date()): number => {
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const end = endOfWeek(ref, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const done = days.filter((d) => isCompleted(checkIns, habit.id, d)).length;
  return Math.min(done / Math.max(habit.target, 1), 1);
};

/**
 * Overall completion for a given date across habits due that day.
 */
export const dayCompletion = (
  habits: Habit[],
  checkIns: CheckInMap,
  date: Date
): { done: number; total: number } => {
  const active = habits.filter((h) => !h.archived && isHabitDueOn(h, date));
  const total = active.length;
  const day = getDayCheckIns(checkIns, date);
  const done = active.filter((h) => day[h.id]).length;
  return { done, total };
};

export const getWeekDays = (ref: Date): Date[] => {
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const end = endOfWeek(ref, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const formatPretty = (d: Date): string => format(d, 'EEE, MMM d');
export const formatDayLabel = (d: Date): string => format(d, 'EEE')[0];
export const formatDayNum = (d: Date): string => format(d, 'd');
export const formatWeekRange = (ref: Date): string => {
  const s = startOfWeek(ref, { weekStartsOn: 1 });
  const e = endOfWeek(ref, { weekStartsOn: 1 });
  if (s.getMonth() === e.getMonth()) {
    return `${format(s, 'MMM d')} – ${format(e, 'd')}`;
  }
  return `${format(s, 'MMM d')} – ${format(e, 'MMM d')}`;
};

export const formatMonth = (d: Date): string => format(d, 'MMMM yyyy');

export {
  format,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  differenceInCalendarDays,
  startOfMonth,
  endOfMonth,
};