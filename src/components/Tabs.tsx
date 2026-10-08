import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Id of the initially-selected tab (defaults to the first enabled one). */
  defaultTabId?: string;
  'aria-label'?: string;
}

/**
 * An accessible tab set following the WAI-ARIA tabs pattern: arrow keys move
 * between tabs, Home/End jump to the ends, and only the active tab is tabbable.
 */
export function Tabs({ items, defaultTabId, 'aria-label': ariaLabel }: TabsProps) {
  const baseId = useId();
  const firstEnabled = items.find((t) => !t.disabled)?.id ?? items[0]?.id;
  const [active, setActive] = useState(defaultTabId ?? firstEnabled);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const enabledIds = items.filter((t) => !t.disabled).map((t) => t.id);

  const focusTab = (id: string) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const idx = enabledIds.indexOf(id);
    if (idx === -1) return;
    let nextIdx: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIdx = (idx + 1) % enabledIds.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIdx = (idx - 1 + enabledIds.length) % enabledIds.length;
        break;
      case 'Home':
        nextIdx = 0;
        break;
      case 'End':
        nextIdx = enabledIds.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    focusTab(enabledIds[nextIdx]);
  };

  return (
    <div>
      <div role="tablist" aria-label={ariaLabel} className={styles.tablist}>
        {items.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              className={styles.tab}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {items.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          className={styles.panel}
        >
          {tab.id === active ? tab.content : null}
        </div>
      ))}
    </div>
  );
}

export default Tabs;
