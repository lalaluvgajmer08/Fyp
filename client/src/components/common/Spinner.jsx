import { cn } from '../../utils/cn';

export function Spinner({ className, label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn('size-5 animate-spin text-gold-400', className)}
      >
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/** Grey block placeholder used while data loads. */
export function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-cream-200/10', className)} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-4 bg-forest-850/40 px-6 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Spinner;
