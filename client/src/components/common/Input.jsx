import { useId } from 'react';
import { cn } from '../../utils/cn';

const fieldBase =
  'w-full bg-forest-900/70 px-4 py-3 text-cream-50 placeholder:text-muted-400/60 ' +
  'ring-1 ring-inset ring-cream-200/15 transition-colors ' +
  'focus:ring-2 focus:ring-gold-400 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

/** Label + control + error message, wired with matching ids for screen readers. */
function Field({ id, label, error, hint, required, children }) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm text-cream-200">
          {label}
          {required && (
            <span className="ml-1 text-gold-400" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ label, error, hint, className, id, required, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required}>
      <input
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldBase, error && 'ring-rose-400/60', className)}
        {...rest}
      />
    </Field>
  );
}

export function Textarea({ label, error, hint, className, id, rows = 6, required, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={cn(fieldBase, 'resize-y leading-relaxed', error && 'ring-rose-400/60', className)}
        {...rest}
      />
    </Field>
  );
}

export function Select({ label, error, hint, options = [], className, id, required, ...rest }) {
  const autoId = useId();
  const fieldId = id || autoId;

  return (
    <Field id={fieldId} label={label} error={error} hint={hint} required={required}>
      <select
        id={fieldId}
        required={required}
        aria-invalid={!!error}
        className={cn(fieldBase, 'appearance-none pr-10', error && 'ring-rose-400/60', className)}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-forest-900">
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default Input;
