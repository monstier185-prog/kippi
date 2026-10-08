import type { ReactNode } from 'react';
import styles from './StateBlock.module.css';

export interface ErrorStateProps {
  /** Short summary of what failed. */
  title: string;
  /** Plain description of what went wrong. */
  what: string;
  /** Whether the user's data is safe despite the error. */
  dataSafe?: boolean;
  /** The recovery action, e.g. a retry button. */
  recoveryAction?: ReactNode;
  /** Whether retrying is likely to help (informs the recovery copy). */
  retryable?: boolean;
}

/**
 * Honest error surface. It answers the four questions a user actually has:
 * what failed, whether their data is safe, how to recover, and whether retrying
 * will help. No blame, no vague "something went wrong".
 */
export function ErrorState({
  title,
  what,
  dataSafe = true,
  recoveryAction,
  retryable,
}: ErrorStateProps) {
  return (
    <div className={`${styles.block} ${styles.error}`} role="alert">
      <p className={styles.title}>{title}</p>
      <div className={styles.detail}>
        <span className={styles.detailLabel}>What happened</span>
        <span className={styles.detailValue}>{what}</span>
      </div>
      <div className={styles.detail}>
        <span className={styles.detailLabel}>Your data</span>
        <span className={dataSafe ? styles.safe : styles.detailValue}>
          {dataSafe
            ? 'Safe — nothing was lost.'
            : 'May be affected. See the recovery step below.'}
        </span>
      </div>
      {typeof retryable === 'boolean' ? (
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Can you retry?</span>
          <span className={styles.detailValue}>
            {retryable
              ? 'Yes — retrying usually resolves this.'
              : 'Retrying will not help; try the recovery step.'}
          </span>
        </div>
      ) : null}
      {recoveryAction ? (
        <div className={styles.actions}>{recoveryAction}</div>
      ) : null}
    </div>
  );
}

export default ErrorState;
