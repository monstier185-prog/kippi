/**
 * Warn on full-page unload (closing the tab, reload, external navigation) while
 * there are unsaved changes. This complements the in-app navigation guard: the
 * browser shows its native "leave site?" prompt so changes are never discarded
 * silently even outside React Router's control.
 */
import { useEffect } from 'react';

export function useBeforeUnload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required by some browsers to trigger the native prompt.
      event.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}

export default useBeforeUnload;
