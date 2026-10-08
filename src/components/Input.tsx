import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Field.module.css';
import { useFieldIds } from './useFieldIds';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  /** Error message; its presence marks the field invalid. */
  error?: string;
  required?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A labelled text input with hint, error, and read-only / disabled states. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required, className, ...rest },
  ref,
) {
  const { controlId, hintId, errorId, describedBy } = useFieldIds({
    id,
    hasHint: Boolean(hint),
    hasError: Boolean(error),
  });

  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        ref={ref}
        id={controlId}
        className={cx(styles.control, error && styles.invalid, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...rest}
      />
      {hint && !error ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});

export default Input;
