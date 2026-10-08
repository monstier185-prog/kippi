/**
 * A reusable editor for a list of repeating entries (experiences, projects,
 * skills, …). It renders each item with a header carrying move-up / move-down
 * buttons AND a keyboard-reorderable DragHandle, plus a remove button, and an
 * "add" button at the bottom. Reordering therefore never depends on a mouse.
 *
 * It is generic over the item type and delegates the fields of each item to a
 * render prop. New items are created empty (no fabricated data).
 */
import { Button } from '../../../components/Button';
import { IconButton } from '../../../components/IconButton';
import { DragHandle } from '../../../components/DragHandle';
import { moveItem } from '../reorder';
import styles from './forms.module.css';

export interface RepeatableListProps<T> {
  items: T[];
  onChange: (next: T[]) => void;
  /** Build a fresh, empty item when the user adds one. */
  makeItem: () => T;
  /** Render the editable fields for one item. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Singular noun for labels, e.g. "pengalaman". */
  itemNoun: string;
  /** Heading shown per item, e.g. (i) => `Pengalaman ${i + 1}`. */
  itemTitle: (index: number) => string;
  /** Copy for the add button, e.g. "Tambah pengalaman". */
  addLabel: string;
  /** Shown when the list is empty. */
  emptyHint: string;
}

const UpIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M7 3l4 5H3z" fill="currentColor" />
  </svg>
);
const DownIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M7 11L3 6h8z" fill="currentColor" />
  </svg>
);
const TrashIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M3 4h8M5.5 4V3h3v1M4 4l.5 7h5L10 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function RepeatableList<T>({
  items,
  onChange,
  makeItem,
  renderItem,
  itemNoun,
  itemTitle,
  addLabel,
  emptyHint,
}: RepeatableListProps<T>) {
  const move = (from: number, direction: 'up' | 'down') => {
    const to = direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    onChange(moveItem(items, from, to));
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...items, makeItem()]);
  };

  return (
    <div>
      {items.length === 0 ? (
        <p className={styles.emptyHint}>{emptyHint}</p>
      ) : (
        <ul className={styles.itemList}>
          {items.map((item, index) => (
            <li key={index} className={styles.item}>
              <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>{itemTitle(index)}</span>
                <div className={styles.itemControls}>
                  <DragHandle
                    aria-label={`Ubah urutan: ${itemTitle(index)} (gunakan panah atas/bawah)`}
                    onKeyboardMove={(dir) => move(index, dir)}
                  />
                  <IconButton
                    size="sm"
                    aria-label={`Pindah ${itemNoun} ke atas`}
                    disabled={index === 0}
                    onClick={() => move(index, 'up')}
                  >
                    {UpIcon}
                  </IconButton>
                  <IconButton
                    size="sm"
                    aria-label={`Pindah ${itemNoun} ke bawah`}
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 'down')}
                  >
                    {DownIcon}
                  </IconButton>
                  <IconButton
                    size="sm"
                    aria-label={`Hapus ${itemNoun}`}
                    onClick={() => remove(index)}
                  >
                    {TrashIcon}
                  </IconButton>
                </div>
              </div>
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      )}
      <div className={styles.addButtonRow} style={{ marginTop: 'var(--space-md)' }}>
        <Button type="button" onClick={add}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

export default RepeatableList;
