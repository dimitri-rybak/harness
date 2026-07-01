import { motion } from 'framer-motion';
import { Button } from './Button';
import { useStore } from '../store/useStore';
import { dayCompletion, todayKey, formatPretty } from '../utils/date';
import type { View } from '../App';

interface HeaderProps {
  view: View;
  setView: (v: View) => void;
  onAdd: () => void;
}

export const Header = ({ view, setView, onAdd }: HeaderProps) => {
  const habits = useStore((s) => s.habits);
  const checkIns = useStore((s) => s.checkIns);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const today = new Date();
  const { done, total } = dayCompletion(habits, checkIns, today);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const navItem = (v: View, label: string) => (
    <button
      onClick={() => setView(v)}
      className={`focus-ring relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        view === v ? 'text-primary' : 'text-secondary hover:text-primary'
      }`}
    >
      {label}
      {view === v && (
        <motion.div
          layoutId="nav-active"
          className="absolute inset-0 -z-10 rounded-lg bg-primary/15"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-card-border/40 bg-ocean-950/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600"
            style={{ boxShadow: '0 4px 16px rgba(100,255,218,0.3)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm-1 14.5l-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4z"
                fill="#0a192f"
              />
            </svg>
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="font-display text-xl font-extrabold leading-none">
              <span className="gradient-text">ChronosFlow</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-widest text-secondary/70">
              Momentum Tracker
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="ml-2 flex items-center gap-1" aria-label="Main">
          {navItem('today', 'Today')}
          {navItem('week', 'Week')}
          {navItem('insights', 'Insights')}
        </nav>

        <div className="flex-1" />

        {/* Date + completion */}
        <div className="hidden items-center gap-2 rounded-full border border-card-border bg-ocean-800/50 px-3 py-1.5 md:flex">
          <span className="h-2 w-2 rounded-full bg-primary" style={{ boxShadow: '0 0 8px rgba(100,255,218,0.6)' }} />
          <span className="text-xs font-medium text-secondary">
            {formatPretty(today)} · {done}/{total} done · {pct}%
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="focus-ring press flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card-light/40 text-secondary hover:text-primary"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Add */}
        <Button variant="primary" size="sm" onClick={onAdd} className="hidden sm:inline-flex">
          + New Habit
        </Button>
        <button
          onClick={onAdd}
          aria-label="Add habit"
          className="focus-ring press flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-ocean-950 sm:hidden"
        >
          +
        </button>
      </div>
    </header>
  );
};