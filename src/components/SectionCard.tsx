import { useId } from 'react';
import type { ReactNode } from 'react';
import styles from './SectionCard.module.css';

export interface SectionCardProps {
  title?: string;
  description?: string;
  /** Actions rendered in the top-right of the header (e.g. buttons). */
  actions?: ReactNode;
  children?: ReactNode;
  /** Heading level for the title (defaults to h2) for correct document outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A bordered content surface with an optional titled, actionable header. */
export function SectionCard({
  title,
  description,
  actions,
  children,
  headingLevel = 2,
  className,
}: SectionCardProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as const;
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={cx(styles.card, className)}
      aria-labelledby={title ? titleId : undefined}
    >
      {hasHeader ? (
        <div className={styles.header}>
          <div className={styles.titles}>
            {title ? (
              <Heading id={titleId} className={styles.title}>
                {title}
              </Heading>
            ) : null}
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export default SectionCard;
