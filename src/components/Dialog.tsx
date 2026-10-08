import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Dialog.module.css';
import { IconButton } from './IconButton';
import { useFocusTrap } from './useFocusTrap';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Footer actions (e.g. confirm / cancel buttons). */
  footer?: ReactNode;
  /** When false, clicking the backdrop does not close the dialog. */
  closeOnOverlayClick?: boolean;
}

/**
 * A modal dialog that traps focus, closes on Escape, restores focus on close,
 * and wires up `role="dialog"` with `aria-modal` and labelled/description ids.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnOverlayClick = true,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Prevent background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    // Backdrop click is a pointer-only convenience; keyboard users close the
    // dialog with Escape (handled above), so no key handler is needed here.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={styles.dialog}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton aria-label="Close dialog" onClick={onClose} size="sm">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>
        {description ? (
          <p id={descId} className={styles.description}>
            {description}
          </p>
        ) : null}
        {children ? <div className={styles.body}>{children}</div> : null}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export default Dialog;
