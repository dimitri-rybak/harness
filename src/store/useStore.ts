import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Habit, Category, CheckInMap, HabitColor, Frequency } from '../types';
import { toggleCheckIn } from '../utils/date';

interface Store extends AppState {
  // habit CRUD
  addHabit: (input: {
    name: string;
    description?: string;
    categoryId: string | null;
    frequency: Frequency;
    target: number;
    color: HabitColor;
    icon: string;
  }) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;

  // categories
  addCategory: (name: string, color: HabitColor) => void;
  deleteCategory: (id: string) => void;

  // check-ins
  toggle: (habitId: string, date: Date) => void;

  // onboarding
  completeOnboarding: () => void;
  setOnboarded: (v: boolean) => void;

  // theme
  setTheme: (t: 'dark' | 'light') => void;

  // seed demo
  seedDemo: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

const defaultCategories: Category[] = [
  { id: 'cat-health', name: 'Health', color: 'emerald' },
  { id: 'cat-mind', name: 'Mind', color: 'violet' },
  { id: 'cat-growth', name: 'Growth', color: 'teal' },
  { id: 'cat-creative', name: 'Creative', color: 'amber' },
];

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      habits: [],
      categories: defaultCategories,
      checkIns: {},
      onboarded: false,
      theme: 'dark',
      layoutOrder: [],

      addHabit: (input) => {
        const habits = get().habits;
        const id = uid();
        const habit: Habit = {
          id,
          name: input.name.trim(),
          description: input.description?.trim(),
          categoryId: input.categoryId,
          frequency: input.frequency,
          target: Math.max(1, Math.min(7, input.target)),
          color: input.color,
          icon: input.icon,
          createdAt: new Date().toISOString(),
          order: habits.length,
        };
        set({
          habits: [...habits, habit],
          layoutOrder: [...get().layoutOrder, id],
        });
      },

      updateHabit: (id, patch) =>
        set((s) => ({
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch, id: h.id } : h)),
        })),

      deleteHabit: (id) =>
        set((s) => ({
          habits: s.habits.filter((h) => h.id !== id),
          layoutOrder: s.layoutOrder.filter((x) => x !== id),
        })),

      reorderHabits: (orderedIds) => set({ layoutOrder: orderedIds }),

      addCategory: (name, color) =>
        set((s) => ({
          categories: [...s.categories, { id: uid(), name: name.trim(), color }],
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          habits: s.habits.map((h) => (h.categoryId === id ? { ...h, categoryId: null } : h)),
        })),

      toggle: (habitId, date) =>
        set((s) => ({ checkIns: toggleCheckIn(s.checkIns, habitId, date) })),

      completeOnboarding: () => set({ onboarded: true }),
      setOnboarded: (v) => set({ onboarded: v }),

      setTheme: (t) => {
        document.documentElement.classList.toggle('dark', t === 'dark');
        localStorage.setItem('chronos-theme', t);
        set({ theme: t });
      },

      seedDemo: () => {
        const now = new Date();
        const ids = ['demo-1', 'demo-2', 'demo-3', 'demo-4'];
        const demoHabits: Habit[] = [
          {
            id: 'demo-1',
            name: 'Morning Meditation',
            description: '10 minutes of mindfulness',
            categoryId: 'cat-mind',
            frequency: 'daily',
            target: 7,
            color: 'violet',
            icon: 'meditate',
            createdAt: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
            order: 0,
          },
          {
            id: 'demo-2',
            name: 'Read 20 Pages',
            categoryId: 'cat-growth',
            frequency: 'daily',
            target: 7,
            color: 'teal',
            icon: 'book',
            createdAt: new Date(Date.now() - 45 * 86400 * 1000).toISOString(),
            order: 1,
          },
          {
            id: 'demo-3',
            name: 'Strength Workout',
            categoryId: 'cat-health',
            frequency: 'weekly',
            target: 4,
            color: 'coral',
            icon: 'dumbbell',
            createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
            order: 2,
          },
          {
            id: 'demo-4',
            name: 'Drink 2L Water',
            categoryId: 'cat-health',
            frequency: 'daily',
            target: 7,
            color: 'sky',
            icon: 'water',
            createdAt: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
            order: 3,
          },
        ];
        const checkIns: CheckInMap = {};
        // seed: meditation 12-day streak, reading 6-day, workout mixed, water 3-day
        const patterns: Record<string, number> = {
          'demo-1': 12,
          'demo-2': 6,
          'demo-3': 0,
          'demo-4': 3,
        };
        for (const [hid, streakLen] of Object.entries(patterns)) {
          for (let i = 0; i < streakLen; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            checkIns[key] = { ...(checkIns[key] ?? {}), [hid]: true };
          }
        }
        // workout done on a few scattered past days
        [1, 3, 5, 8].forEach((off) => {
          const d = new Date(now);
          d.setDate(now.getDate() - off);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          checkIns[key] = { ...(checkIns[key] ?? {}), 'demo-3': true };
        });
        set({
          habits: demoHabits,
          layoutOrder: ids,
          checkIns,
          onboarded: true,
        });
      },
    }),
    {
      name: 'chronosflow-store',
      version: 1,
    }
  )
)