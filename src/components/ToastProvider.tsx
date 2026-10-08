import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './Toast.module.css';
import { IconButton } from './IconButton';
import {
  ToastContext,
  type ToastOptions,
  type ToastRecord,
} from './toast-context';

const DEFAULT_DURATION = 5000;

/**
 * Provides the toast context and renders the live region that announces and
 * displays transient notifications. Toasts auto-dismiss unless `duration` is 0.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const duration = options.duration ?? DEFAULT_DURATION;
      const record: ToastRecord = {
        id,
        title: options.title,
        message: options.message,
        variant: options.variant ?? 'info',
        duration,
      };
      setToasts((current) => [...current, record]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={styles.region}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.variant]}`}
            role={toast.variant === 'error' ? 'alert' : 'status'}
          >
            <div className={styles.body}>
              <p className={styles.title}>{toast.title}</p>
              {toast.message ? (
                <p className={styles.message}>{toast.message}</p>
              ) : null}
            </div>
            <IconButton
              aria-label="Dismiss notification"
              size="sm"
              onClick={() => dismiss(toast.id)}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
