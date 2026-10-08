/**
 * The editor's left navigation: an ordered list of the portfolio's sections
 * plus a persistent "Settings" entry. Each section row can be selected, hidden
 * / shown, deleted (with confirmation handled by the parent), and reordered.
 *
 * Reordering is available three ways so it never depends on a pointer:
 *  - drag-and-drop (native HTML5 draggable),
 *  - move-up / move-down buttons,
 *  - keyboard via the DragHandle (ArrowUp / ArrowDown while the handle is focused).
 */
import { useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { DragHandle } from '../../components/DragHandle';
import { Dropdown } from '../../components/Dropdown';
import type { PortfolioSection, SectionType } from '../../models';
import { SECTION_LABEL, SECTION_ORDER } from './sectionMeta';
import styles from './SectionNav.module.css';

export const SETTINGS_PANE = 'settings';

export interface SectionNavProps {
  sections: PortfolioSection[];
  /** The id of the active section, or SETTINGS_PANE. */
  activeId: string;
  onSelect: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onToggleVisible: (id: string) => void;
  onDelete: (section: PortfolioSection) => void;
  onAdd: (type: SectionType) => void;
}

const EyeIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <circle cx="8" cy="8" r="1.8" fill="currentColor" />
  </svg>
);
const EyeOffIcon = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M1 8s2.5-4.5 7-4.5c1 0 1.9.2 2.7.5M15 8s-2.5 4.5-7 4.5c-1 0-1.9-.2-2.7-.5M2 2l12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);
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
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M3.5 4.5h9M6 4.5V3.5h4v1M4.5 4.5l.6 8h5.8l.6-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const PlusIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M7 2v10M2 7h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export function SectionNav({
  sections,
  activeId,
  onSelect,
  onMove,
  onToggleVisible,
  onDelete,
  onAdd,
}: SectionNavProps) {
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  const dragIndex = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const existingTypes = new Set(sections.map((s) => s.type));
  const addable = SECTION_ORDER.filter((t) => !existingTypes.has(t));

  return (
    <nav className={styles.nav} aria-label="Bagian portfolio">
      <p className={styles.groupLabel} id="sections-group">
        Bagian
      </p>
      <ul className={styles.list} aria-labelledby="sections-group">
        {ordered.map((section, index) => {
          const selected = section.id === activeId;
          return (
            <li
              key={section.id}
              className={`${styles.row} ${selected ? styles.selected : ''} ${
                dragOver === index ? styles.dragOver : ''
              }`}
              draggable
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(index);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex.current !== null && dragIndex.current !== index) {
                  onMove(dragIndex.current, index);
                }
                dragIndex.current = null;
                setDragOver(null);
              }}
            >
              <DragHandle
                aria-label={`Ubah urutan: ${SECTION_LABEL[section.type]} (panah atas/bawah)`}
                onKeyboardMove={(dir) =>
                  onMove(index, dir === 'up' ? index - 1 : index + 1)
                }
              />
              <button
                type="button"
                className={styles.selectBtn}
                aria-label={`Buka bagian ${SECTION_LABEL[section.type]}`}
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelect(section.id)}
              >
                <span className={styles.rowTitle}>
                  {SECTION_LABEL[section.type]}
                  {!section.isVisible ? (
                    <span className={styles.hiddenTag}> (disembunyikan)</span>
                  ) : null}
                </span>
              </button>
              <div className={styles.rowControls}>
                <IconButton
                  size="sm"
                  aria-label={`Pindah ${SECTION_LABEL[section.type]} ke atas`}
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                >
                  {UpIcon}
                </IconButton>
                <IconButton
                  size="sm"
                  aria-label={`Pindah ${SECTION_LABEL[section.type]} ke bawah`}
                  disabled={index === ordered.length - 1}
                  onClick={() => onMove(index, index + 1)}
                >
                  {DownIcon}
                </IconButton>
                <IconButton
                  size="sm"
                  aria-label={
                    section.isVisible
                      ? `Sembunyikan ${SECTION_LABEL[section.type]}`
                      : `Tampilkan ${SECTION_LABEL[section.type]}`
                  }
                  aria-pressed={!section.isVisible}
                  onClick={() => onToggleVisible(section.id)}
                >
                  {section.isVisible ? EyeIcon : EyeOffIcon}
                </IconButton>
                <IconButton
                  size="sm"
                  aria-label={`Hapus ${SECTION_LABEL[section.type]}`}
                  onClick={() => onDelete(section)}
                >
                  {TrashIcon}
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.addRow}>
        {addable.length > 0 ? (
          <Dropdown
            aria-label="Tambah bagian"
            trigger={(triggerProps) => (
              <Button {...triggerProps} startIcon={PlusIcon} fullWidth>
                Tambah bagian
              </Button>
            )}
            items={addable.map((type) => ({
              id: type,
              label: SECTION_LABEL[type],
              onSelect: () => onAdd(type),
            }))}
          />
        ) : (
          <p className={styles.allAdded}>Semua jenis bagian sudah ditambahkan.</p>
        )}
      </div>

      <p className={styles.groupLabel} id="settings-group">
        Pengaturan
      </p>
      <ul className={styles.list} aria-labelledby="settings-group">
        <li
          className={`${styles.row} ${
            activeId === SETTINGS_PANE ? styles.selected : ''
          }`}
        >
          <button
            type="button"
            className={styles.selectBtn}
            aria-current={activeId === SETTINGS_PANE ? 'true' : undefined}
            onClick={() => onSelect(SETTINGS_PANE)}
          >
            <span className={styles.rowTitle}>Pengaturan</span>
            <span className={styles.rowDesc}>Judul & privasi</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default SectionNav;
