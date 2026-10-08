import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';
import { useId } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id?: string;
  label: string;
  hint?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A labelled checkbox with a drawn tick, keyboard focus ring, and hint. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ id, label, hint, className, ...rest }, ref) {
    const generated = useId();
    const controlId = id ?? generated;
    const hintId = `${controlId}-hint`;
    return (
      <div className={styles.wrapper}>
        <label className={styles.row} htmlFor={controlId}>
          <input
            ref={ref}
            id={controlId}
            type="checkbox"
            className={cx(styles.input, className)}
            aria-describedby={hint ? hintId : undefined}
            {...rest}
          />
          <span className={styles.box} aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M2.5 6.5l2.5 2.5 4.5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.text}>{label}</span>
        </label>
        {hint ? (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        ) : null}
      </div>
    );
  },
);

export default Checkbox;
