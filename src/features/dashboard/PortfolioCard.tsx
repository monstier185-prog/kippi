import { IconButton } from '../../components/IconButton';
import { Dropdown } from '../../components/Dropdown';
import type { Portfolio } from '../../models';
import { PortfolioThumbnail } from './PortfolioThumbnail';
import { STATUS_LABEL, formatLastEdited } from './status';
import styles from './PortfolioCard.module.css';

export interface PortfolioCardProps {
  portfolio: Portfolio;
  onOpen: (portfolio: Portfolio) => void;
  onDuplicate: (portfolio: Portfolio) => void;
  onRename: (portfolio: Portfolio) => void;
  onDelete: (portfolio: Portfolio) => void;
}

const MoreIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <circle cx="9" cy="3.5" r="1.4" fill="currentColor" />
    <circle cx="9" cy="9" r="1.4" fill="currentColor" />
    <circle cx="9" cy="14.5" r="1.4" fill="currentColor" />
  </svg>
);

/**
 * One portfolio in the dashboard list: an honest thumbnail, the real title,
 * status, and last-edited date, plus a keyboard-navigable action menu
 * (open / duplicate / rename / delete). Delete is routed through the parent so
 * it can require confirmation; nothing is deleted from here directly.
 */
export function PortfolioCard({
  portfolio,
  onOpen,
  onDuplicate,
  onRename,
  onDelete,
}: PortfolioCardProps) {
  const statusClass =
    portfolio.status === 'published'
      ? styles.statusPublished
      : portfolio.status === 'private'
        ? styles.statusPrivate
        : styles.statusDraft;

  return (
    <li className={styles.card}>
      <button
        type="button"
        className={styles.openArea}
        onClick={() => onOpen(portfolio)}
      >
        <PortfolioThumbnail portfolio={portfolio} />
        <span className="sr-only">Buka {portfolio.title}</span>
      </button>

      <div className={styles.body}>
        <div className={styles.heading}>
          <h3 className={styles.title}>{portfolio.title}</h3>
          <Dropdown
            aria-label={`Aksi untuk ${portfolio.title}`}
            trigger={(triggerProps) => (
              <IconButton
                {...triggerProps}
                size="sm"
                aria-label={`Aksi untuk ${portfolio.title}`}
              >
                {MoreIcon}
              </IconButton>
            )}
            items={[
              {
                id: 'open',
                label: 'Buka',
                onSelect: () => onOpen(portfolio),
              },
              {
                id: 'duplicate',
                label: 'Duplicate',
                onSelect: () => onDuplicate(portfolio),
              },
              {
                id: 'rename',
                label: 'Rename',
                onSelect: () => onRename(portfolio),
              },
              {
                id: 'delete',
                label: 'Delete',
                danger: true,
                onSelect: () => onDelete(portfolio),
              },
            ]}
          />
        </div>
        <div className={styles.meta}>
          <span className={`${styles.status} ${statusClass}`}>
            {STATUS_LABEL[portfolio.status]}
          </span>
          <span className={styles.edited}>
            Diubah {formatLastEdited(portfolio.updatedAt)}
          </span>
        </div>
      </div>
    </li>
  );
}

export default PortfolioCard;
