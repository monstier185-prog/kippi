/**
 * Compact, honest save-state indicator for the top bar. It reflects the real
 * SaveState from the draft hook and announces changes politely to assistive
 * tech (aria-live) so a screen-reader user hears "Tersimpan" / "Menyimpan…".
 */
import type { SaveState } from '../../models';
import styles from './SaveStatus.module.css';

const LABEL: Record<SaveState, string> = {
  saved: 'Tersimpan',
  saving: 'Menyimpan…',
  unsaved: 'Perubahan belum disimpan',
  error: 'Gagal menyimpan',
};

export function SaveStatus({ state }: { state: SaveState }) {
  return (
    <span
      className={`${styles.status} ${styles[state]}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.dot} aria-hidden="true" />
      {LABEL[state]}
    </span>
  );
}

export default SaveStatus;
