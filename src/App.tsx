import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { ParticleBackground } from './components/ParticleBackground';
import { EmptyState } from './components/EmptyState';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { InsightsView } from './components/InsightsView';
import { HabitForm } from './components/HabitForm';
import { useStore } from './store/useStore';
import type { Habit } from './types';

export type View = 'today' | 'week' | 'insights';

export default function App() {
  const habits = useStore((s) => s.habits);
  const categories = useStore((s) => s.categories);
  const onboarded = useStore((s) => s.onboarded);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const addHabit = useStore((s) => s.addHabit);
  const updateHabit = useStore((s) => s.updateHabit);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const [view, setView] = useState<View>('today');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  // sync theme class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // keyboard shortcut: N to add, 1/2/3 to switch views
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openCreate();
      } else if (e.key === '1') setView('today');
      else if (e.key === '2') setView('week');
      else if (e.key === '3') setView('insights');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    const h = habits.find((x) => x.id === id) ?? null;
    setEditing(h);
    setFormOpen(true);
  };

  const handleSave = (data: any) => {
    if (editing) {
      updateHabit(editing.id, data);
    } else {
      addHabit(data);
    }
  };

  const hasHabits = habits.filter((h) => !h.archived).length > 0;
  const showEmpty = !hasHabits && !onboarded;

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />

      <div className="relative z-10">
        <Header view={view} setView={setView} onAdd={openCreate} />

        <main className="relative">
          {showEmpty && view === 'today' ? (
            <div className="px-4 py-10 md:py-16">
              <EmptyState
                onAdd={() => {
                  completeOnboarding();
                  openCreate();
                }}
                onComplete={completeOnboarding}
              />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {view === 'today' && <TodayView onAdd={openCreate} onEdit={openEdit} />}
                {view === 'week' && <WeekView />}
                {view === 'insights' && <InsightsView />}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Footer */}
          <footer className="mx-auto max-w-7xl px-4 py-8 md:px-6">
            <div className="flex flex-col items-center justify-between gap-3 border-t border-card-border/40 pt-6 text-xs text-secondary/60 md:flex-row">
              <p>
                <span className="gradient-text font-display font-bold">ChronosFlow</span> — Build
                momentum, one day at a time.
              </p>
              <div className="flex items-center gap-3">
                <kbd className="rounded border border-card-border bg-ocean-800 px-1.5 py-0.5 font-mono">
                  N
                </kbd>
                <span>New habit</span>
                <span className="text-secondary/40">·</span>
                <kbd className="rounded border border-card-border bg-ocean-800 px-1.5 py-0.5 font-mono">
                  1
                </kbd>
                <kbd className="rounded border border-card-border bg-ocean-800 px-1.5 py-0.5 font-mono">
                  2
                </kbd>
                <kbd className="rounded border border-card-border bg-ocean-800 px-1.5 py-0.5 font-mono">
                  3
                </kbd>
                <span>Views</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        categories={categories}
        editing={editing}
      />
    </div>
  );
}