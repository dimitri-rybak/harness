export type Frequency = 'daily' | 'weekly';

export type HabitColor =
  | 'teal'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'emerald'
  | 'sky'
  | 'coral'
  | 'gold';

export interface Category {
  id: string;
  name: string;
  color: HabitColor;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  categoryId: string | null;
  frequency: Frequency;
  target: number; // times per week
  color: HabitColor;
  icon: string; // icon key
  createdAt: string; // ISO
  order: number;
  archived?: boolean;
}

// Map of dateKey (YYYY-MM-DD) -> habitId -> completed (boolean)
export type CheckInMap = Record<string, Record<string, boolean>>;

export interface AppState {
  habits: Habit[];
  categories: Category[];
  checkIns: CheckInMap;
  onboarded: boolean;
  theme: 'dark' | 'light';
  layoutOrder: string[];
}

export const COLOR_MAP: Record<HabitColor, { hex: string; glow: string; soft: string }> = {
  teal: { hex: '#64ffda', glow: 'rgba(100,255,218,0.35)', soft: 'rgba(100,255,218,0.12)' },
  amber: { hex: '#ff9800', glow: 'rgba(255,152,0,0.35)', soft: 'rgba(255,152,0,0.12)' },
  rose: { hex: '#f44336', glow: 'rgba(244,67,54,0.35)', soft: 'rgba(244,67,54,0.12)' },
  violet: { hex: '#a78bfa', glow: 'rgba(167,139,250,0.35)', soft: 'rgba(167,139,250,0.12)' },
  emerald: { hex: '#4caf50', glow: 'rgba(76,175,80,0.35)', soft: 'rgba(76,175,80,0.12)' },
  sky: { hex: '#38bdf8', glow: 'rgba(56,189,248,0.35)', soft: 'rgba(56,189,248,0.12)' },
  coral: { hex: '#fb7185', glow: 'rgba(251,113,133,0.35)', soft: 'rgba(251,113,133,0.12)' },
  gold: { hex: '#fbbf24', glow: 'rgba(251,191,36,0.35)', soft: 'rgba(251,191,36,0.12)' },
};

export const HABIT_ICONS: Record<string, string> = {
  check: '✓',
  book: '📚',
  run: '🏃',
  water: '💧',
  meditate: '🧘',
  pen: '✍️',
  dumbbell: '🏋️',
  moon: '🌙',
  music: '🎵',
  code: '💻',
  leaf: '🌿',
  sun: '☀️',
  heart: '❤️',
  target: '🎯',
  flame: '🔥',
  clock: '⏰',
};

export const ICON_KEYS = Object.keys(HABIT_ICONS);
export const COLOR_KEYS = Object.keys(COLOR_MAP) as HabitColor[];