import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';
import { useFieldIds } from './useFieldIds';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A labelled multi-line text field matching Input's states. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
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
        <textarea
          ref={ref}
          id={controlId}
          className={cx(
            styles.control,
            styles.textarea,
            error && styles.invalid,
            className,
          )}
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
  },
);

export default Textarea;
