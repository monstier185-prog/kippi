import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import styles from './DragHandle.module.css';

export interface DragHandleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Accessible label describing what this handle moves, e.g. "Reorder: Work experience". */
  'aria-label': string;
  /**
   * Keyboard alternative to pointer dragging. Wired in the editor (FEAT later):
   * when the handle is focused, ArrowUp/ArrowDown move the item; the editor
   * passes a handler here. Documented now so the contract is stable.
   */
  onKeyboardMove?: (direction: 'up' | 'down') => void;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A drag handle for reorderable lists. Pointer dragging is wired by the parent
 * (e.g. via drag-and-drop). It also ships a keyboard alternative so reordering
 * never depends on a mouse: with the handle focused, ArrowUp / ArrowDown call
 * `onKeyboardMove`. This is the documented keyboard path to be used by the
 * editor when it wires reordering.
 */
export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  function DragHandle({ onKeyboardMove, className, onKeyDown, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx(styles.handle, className)}
        onKeyDown={(event) => {
          if (onKeyboardMove && event.key === 'ArrowUp') {
            event.preventDefault();
            onKeyboardMove('up');
          } else if (onKeyboardMove && event.key === 'ArrowDown') {
            event.preventDefault();
            onKeyboardMove('down');
          }
          onKeyDown?.(event);
        }}
        {...rest}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <g fill="currentColor">
            <circle cx="6" cy="4" r="1.1" />
            <circle cx="10" cy="4" r="1.1" />
            <circle cx="6" cy="8" r="1.1" />
            <circle cx="10" cy="8" r="1.1" />
            <circle cx="6" cy="12" r="1.1" />
            <circle cx="10" cy="12" r="1.1" />
          </g>
        </svg>
      </button>
    );
  },
);

export default DragHandle;
