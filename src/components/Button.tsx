import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When true the button shows a spinner, hides its label, and is disabled. */
  loading?: boolean;
  /** Accessible label announced while loading (defaults to "Loading"). */
  loadingLabel?: string;
  fullWidth?: boolean;
  /** Optional leading icon (decorative). */
  startIcon?: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Primary action button. Coral `primary` is reserved for the single most
 * important action on a surface; `secondary`/`ghost` carry everything else.
 * Loading disables interaction and keeps the button's width stable.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      loadingLabel = 'Loading',
      fullWidth = false,
      startIcon,
      disabled,
      className,
      children,
      type,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cx(
          styles.button,
          styles[variant],
          styles[size],
          loading && styles.loading,
          fullWidth && styles.fullWidth,
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            <span className="sr-only">{loadingLabel}</span>
          </>
        ) : null}
        {!loading && startIcon ? (
          <span aria-hidden="true">{startIcon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

export default Button;
