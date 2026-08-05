import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '../components/common/icons';
import { cn } from '../utils/cn';

const ToastContext = createContext(null);

const TONES = {
  success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  error: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
  info: 'border-gold-400/40 bg-gold-500/10 text-gold-100',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { tone = 'info', duration = 4500 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list, { id, message, tone }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (msg, opts) => push(msg, { ...opts, tone: 'success' }),
      error: (msg, opts) => push(msg, { ...opts, tone: 'error' }),
      info: (msg, opts) => push(msg, { ...opts, tone: 'info' }),
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(
        <div
          role="region"
          aria-label="Notifications"
          className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-full max-w-sm flex-col gap-3"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              aria-live="polite"
              className={cn(
                'pointer-events-auto flex items-start gap-3 border px-4 py-3.5 shadow-xl backdrop-blur-md',
                TONES[t.tone] ?? TONES.info
              )}
            >
              <p className="flex-1 text-sm leading-relaxed">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="opacity-60 transition-opacity hover:opacity-100"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
