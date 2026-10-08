import type { ReactNode } from 'react';
import styles from './StateBlock.module.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** The primary action users should take to leave the empty state. */
  action?: ReactNode;
  /** Optional illustrative example (e.g. a sample layout preview). */
  example?: ReactNode;
}

/**
 * Shown when a region has no content yet. It is never fake data: it states the
 * situation plainly and offers the single most useful next action.
 */
export function EmptyState({
  title,
  description,
  action,
  example,
}: EmptyStateProps) {
  return (
    <div className={styles.block}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.actions}>{action}</div> : null}
      {example ? <div className={styles.example}>{example}</div> : null}
    </div>
  );
}

export default EmptyState;
