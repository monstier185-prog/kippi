import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Required: an icon button has no visible text, so it must be labelled. */
  'aria-label': string;
  size?: IconButtonSize;
  /** The icon element (rendered decoratively; the label does the describing). */
  children: ReactNode;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A square, icon-only button. The `aria-label` prop is required by the type
 * system so an icon button can never ship without an accessible name.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { size = 'md', className, children, type, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cx(styles.iconButton, styles[size], className)}
        {...rest}
      >
        <span aria-hidden="true">{children}</span>
      </button>
    );
  },
);

export default IconButton;
