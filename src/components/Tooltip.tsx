import { cloneElement, useId, useState } from 'react';
import type { ReactElement } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** The tooltip text. Keep it short; a tooltip is a supplement, not content. */
  label: string;
  /**
   * A single focusable child element. It receives `aria-describedby` plus the
   * hover/focus handlers so the tooltip works for both pointer and keyboard.
   */
  children: ReactElement;
}

/**
 * A hover/focus tooltip. Used only where a control genuinely needs a short
 * supplementary hint; it is never the sole source of essential information.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const child = cloneElement(children, {
    'aria-describedby': id,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <span className={styles.wrapper}>
      {child}
      {visible ? (
        <span role="tooltip" id={id} className={styles.bubble}>
          {label}
        </span>
      ) : null}
    </span>
  );
}

export default Tooltip;
