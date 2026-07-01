import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from './Button';
import { ProgressRing } from './ProgressRing';
import { IconBadge } from './IconBadge';

const STEPS = [
  {
    title: 'Create your first habit',
    body: 'Define what you want to build — anything from "Read 20 pages" to "10-minute meditation". Pick a color, an icon, and a target.',
    emoji: '🎯',
    accent: 'teal' as const,
  },
  {
    title: 'Check in every day',
    body: 'Open ChronosFlow daily and tap the toggle. Momentum compounds — even a single day starts a streak you won\u2019t want to break.',
    emoji: '✅',
    accent: 'emerald' as const,
  },
  {
    title: 'Watch momentum build',
    body: 'Progress rings animate, momentum trails grow, and streaks light up at 3, 7, 14, and 30 days. Watch your dashboard come alive.',
    emoji: '🚀',
    accent: 'amber' as const,
  },
];

interface EmptyStateProps {
  onAdd: () => void;
  onComplete: () => void;
}

export const EmptyState = ({ onAdd, onComplete }: EmptyStateProps) => {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const last = step === STEPS.length - 1;

  const finish = () => {
    onComplete();
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card mx-auto max-w-2xl rounded-3xl p-8 md:p-12"
        >
          {/* Hero */}
          <div className="flex flex-col items-center text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-6"
            >
              <ProgressRing progress={0.68} size={120} stroke={10} colorOverride="#64ffda" />
              <div className="absolute inset-0 flex items-center justify-center">
                <IconBadge icon="flame" color="teal" size={56} animateHover={false} />
              </div>
            </motion.div>

            <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              <span className="gradient-text">Build momentum,</span>
              <br />
              <span className="text-primary">one day at a time.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm text-secondary">
              ChronosFlow turns daily routines into a living dashboard of progress. No habits yet
              — let's change that.
            </p>
          </div>

          {/* Tutorial */}
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-ocean-600"
                >
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={false}
                    animate={{ width: i <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4 rounded-2xl border border-card-border bg-ocean-800/40 p-5"
              >
                <div className="text-4xl">{STEPS[step].emoji}</div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <h3 className="font-display text-xl font-bold text-primary">
                    {STEPS[step].title}
                  </h3>
                  <p className="mt-1 text-sm text-secondary">{STEPS[step].body}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="focus-ring press text-xs font-medium text-secondary hover:text-primary"
              >
                Skip tutorial
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <Button variant="subtle" size="sm" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </Button>
                )}
                {last ? (
                  <Button variant="primary" size="sm" onClick={onAdd}>
                    Create my first habit →
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-secondary/60">
            <span aria-hidden>⌨️</span>
            <span>Tip: press </span>
            <kbd className="rounded border border-card-border bg-ocean-800 px-1.5 py-0.5 font-mono">N</kbd>
            <span> anytime to add a habit</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};