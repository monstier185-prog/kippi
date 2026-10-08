import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import styles from './Field.module.css';
import { useFieldIds } from './useFieldIds';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  /** Optional placeholder shown as a disabled first option. */
  placeholder?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A labelled native select with a custom chevron and shared field states. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { id, label, hint, error, required, options, placeholder, className, ...rest },
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
        <span className={styles.selectWrap}>
          <select
            ref={ref}
            id={controlId}
            className={cx(
              styles.control,
              styles.select,
              error && styles.invalid,
              className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            defaultValue={placeholder && !rest.value ? '' : undefined}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className={styles.selectChevron}
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
          >
            <path
              d="M3 5l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
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

export default Select;
