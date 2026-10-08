import type { ReactNode } from 'react';
import styles from './PreviewFrame.module.css';

export interface PreviewFrameProps {
  children: ReactNode;
  /** A representative address shown in the chrome, e.g. "mystreet.id/p/you". */
  address?: string;
  /** Simulated device width for responsive previews. */
  device?: 'desktop' | 'tablet' | 'mobile';
  /** Accessible label for the preview region. */
  label?: string;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * A browser-chrome frame used to present a live portfolio preview. The chrome
 * is decorative; the address is illustrative only (local-first — not a live
 * server URL) and never implies hosting that does not exist.
 */
export function PreviewFrame({
  children,
  address,
  device = 'desktop',
  label = 'Portfolio preview',
  className,
}: PreviewFrameProps) {
  return (
    <div
      className={cx(
        styles.frame,
        device === 'tablet' && styles.tablet,
        device === 'mobile' && styles.mobile,
        className,
      )}
      role="group"
      aria-label={label}
    >
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </span>
        {address ? <span className={styles.addressBar}>{address}</span> : null}
      </div>
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}

export default PreviewFrame;
