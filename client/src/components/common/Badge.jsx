import { cn } from '../../utils/cn';

const tones = {
  neutral: 'bg-cream-200/10 text-cream-200',
  gold: 'bg-gold-500/15 text-gold-300',
  success: 'bg-emerald-500/12 text-emerald-300',
  warning: 'bg-amber-500/12 text-amber-300',
  danger: 'bg-rose-500/12 text-rose-300',
};

/** Maps a news status to a tone so the colour is consistent everywhere. */
export const STATUS_TONE = {
  published: 'success',
  draft: 'warning',
  archived: 'neutral',
};

export default function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs capitalize',
        tones[tone] ?? tones.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
