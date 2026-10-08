import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'> {
  id?: string;
  label: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * An on/off switch built on a native checkbox so it stays keyboard operable
 * (Space toggles) and announces its checked state to assistive tech.
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { id, label, className, ...rest },
  ref,
) {
  const generated = useId();
  const controlId = id ?? generated;
  return (
    <label className={styles.row} htmlFor={controlId}>
      <input
        ref={ref}
        id={controlId}
        type="checkbox"
        role="switch"
        className={cx(styles.input, className)}
        {...rest}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
      <span className={styles.text}>{label}</span>
    </label>
  );
});

export default Toggle;
