import Button from './Button';

/** Shown when a list has no rows, or a query fails. */
export default function EmptyState({ title, description, action, tone = 'neutral' }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <p
        className={
          tone === 'error'
            ? 'font-display text-2xl text-rose-300'
            : 'font-display text-2xl text-cream-50'
        }
      >
        {title}
      </p>

      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-400">{description}</p>
      )}

      {action && (
        <div className="mt-8">
          {action.to || action.href ? (
            <Button to={action.to} href={action.href} variant="primary">
              {action.label}
            </Button>
          ) : (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
