import { useEffect } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(el: HTMLElement): boolean {
  if (el.hasAttribute('hidden')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  // `display: none` reports empty computed display; guard for environments
  // (like jsdom) that do not perform layout, where offsetParent is always null.
  const style =
    typeof window !== 'undefined' && window.getComputedStyle
      ? window.getComputedStyle(el)
      : null;
  if (style && (style.display === 'none' || style.visibility === 'hidden')) {
    return false;
  }
  return true;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE),
  ).filter(isVisible);
}

/**
 * Traps keyboard focus within `containerRef` while `active`, moves initial
 * focus into it, and restores focus to the previously-focused element on
 * teardown. Tab/Shift+Tab wrap at the ends of the focusable set.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusFirst = () => {
      const focusable = getFocusable(container);
      (focusable[0] ?? container).focus();
    };
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey) {
        if (activeEl === first || !container.contains(activeEl)) {
          event.preventDefault();
          last.focus();
        }
      } else if (activeEl === last || !container.contains(activeEl)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef]);
}
