import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  id: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  /** Renders the toggle; receives props to spread onto a focusable element. */
  trigger: (props: {
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    onClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    ref: (el: HTMLButtonElement | null) => void;
  }) => ReactNode;
  items: DropdownItem[];
  'aria-label'?: string;
}

/**
 * A menu button with full keyboard support: Enter/Space/ArrowDown open it,
 * arrows move the active item, Enter activates, Escape closes and returns
 * focus to the trigger, and an outside click dismisses it.
 */
export function Dropdown({ trigger, items, 'aria-label': ariaLabel }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const enabledIndexes = items
    .map((item, i) => (item.disabled ? -1 : i))
    .filter((i) => i !== -1);

  const openMenu = (index = enabledIndexes[0] ?? 0) => {
    setOpen(true);
    setActiveIndex(index);
  };

  const closeMenu = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const moveActive = (direction: 1 | -1) => {
    const pos = enabledIndexes.indexOf(activeIndex);
    const nextPos =
      (pos + direction + enabledIndexes.length) % enabledIndexes.length;
    setActiveIndex(enabledIndexes[nextPos]);
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(enabledIndexes[0] ?? 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(enabledIndexes[enabledIndexes.length - 1] ?? 0);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(enabledIndexes[0] ?? 0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? 0);
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const selectItem = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onSelect();
    closeMenu();
  };

  return (
    <div ref={rootRef} className={styles.root}>
      {trigger({
        'aria-haspopup': 'menu',
        'aria-expanded': open,
        onClick: () => (open ? closeMenu(false) : openMenu()),
        onKeyDown: onTriggerKeyDown,
        ref: (el) => {
          triggerRef.current = el;
        },
      })}
      {open ? (
        <ul
          id={menuId}
          role="menu"
          aria-label={ariaLabel}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, index) => {
            const classes = [styles.item];
            if (index === activeIndex) classes.push(styles.active);
            if (item.danger) classes.push(styles.danger);
            return (
              <li key={item.id} role="none">
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  className={classes.join(' ')}
                  disabled={item.disabled}
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => selectItem(item)}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default Dropdown;
