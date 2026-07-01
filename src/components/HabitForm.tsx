import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { COLOR_KEYS, ICON_KEYS, HABIT_ICONS, COLOR_MAP } from '../types';
import type { Habit, HabitColor, Frequency, Category } from '../types';

interface HabitFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    categoryId: string | null;
    frequency: Frequency;
    target: number;
    color: HabitColor;
    icon: string;
  }) => void;
  categories: Category[];
  editing?: Habit | null;
}

export const HabitForm = ({ open, onClose, onSave, categories, editing }: HabitFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [target, setTarget] = useState(7);
  const [color, setColor] = useState<HabitColor>('teal');
  const [icon, setIcon] = useState('check');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setDescription(editing.description ?? '');
        setCategoryId(editing.categoryId);
        setFrequency(editing.frequency);
        setTarget(editing.target);
        setColor(editing.color);
        setIcon(editing.icon);
      } else {
        setName('');
        setDescription('');
        setCategoryId(null);
        setFrequency('daily');
        setTarget(7);
        setColor('teal');
        setIcon('check');
      }
      setError('');
    }
  }, [open, editing]);

  const submit = () => {
    if (!name.trim()) {
      setError('Please give your habit a name');
      return;
    }
    onSave({ name, description, categoryId, frequency, target, color, icon });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Habit' : 'New Habit'}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-5"
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Habit Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Morning Run"
            className="focus-ring w-full rounded-xl border border-card-border bg-ocean-800/60 px-4 py-3 text-primary placeholder:text-secondary/50"
          />
          {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Description <span className="font-normal normal-case text-secondary/60">(optional)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does success look like?"
            className="focus-ring w-full rounded-xl border border-card-border bg-ocean-800/60 px-4 py-3 text-primary placeholder:text-secondary/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
              Category
            </label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="focus-ring w-full rounded-xl border border-card-border bg-ocean-800/60 px-3 py-3 text-primary"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
              Frequency
            </label>
            <div className="flex rounded-xl border border-card-border bg-ocean-800/60 p-1">
              {(['daily', 'weekly'] as Frequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${
                    frequency === f ? 'bg-primary/20 text-primary' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Target: <span className="text-primary">{target}×</span> per{' '}
            {frequency === 'daily' ? 'week' : 'week'}
          </label>
          <input
            type="range"
            min={1}
            max={7}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setColor(k)}
                aria-label={`Color ${k}`}
                className="focus-ring relative h-9 w-9 rounded-full transition"
                style={{
                  background: COLOR_MAP[k].hex,
                  boxShadow: color === k ? `0 0 0 3px #0a192f, 0 0 0 5px ${COLOR_MAP[k].hex}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-secondary">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2">
            {ICON_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setIcon(k)}
                aria-label={`Icon ${k}`}
                className="focus-ring flex h-10 items-center justify-center rounded-lg text-lg transition"
                style={{
                  background: icon === k ? COLOR_MAP[color].soft : 'rgba(23,42,69,0.5)',
                  border: `1px solid ${icon === k ? COLOR_MAP[color].hex : 'transparent'}`,
                }}
              >
                {HABIT_ICONS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="subtle" full onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" full>
            {editing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};