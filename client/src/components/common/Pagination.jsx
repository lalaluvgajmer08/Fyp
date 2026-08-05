import Button from './Button';
import { cn } from '../../utils/cn';

/** Page-number pagination driven by the API's `meta` block. */
export default function Pagination({ page, totalPages, onChange, className }) {
  if (!totalPages || totalPages <= 1) return null;

  // Window of at most 5 page numbers around the current page
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-between gap-4 pt-6', className)}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ← Previous
      </Button>

      <ul className="flex items-center gap-1">
        {pages.map((n) => (
          <li key={n}>
            <button
              type="button"
              onClick={() => onChange(n)}
              aria-current={n === page ? 'page' : undefined}
              className={cn(
                'numeric size-9 text-sm transition-colors',
                n === page
                  ? 'bg-gold-500 text-forest-950'
                  : 'text-cream-200 hover:bg-cream-200/10'
              )}
            >
              {n}
            </button>
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next →
      </Button>
    </nav>
  );
}
