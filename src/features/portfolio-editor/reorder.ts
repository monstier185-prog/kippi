/**
 * Pure array-reorder helpers shared by section reordering and in-section item
 * reordering. Kept pure so they are trivial to unit-test and reuse across the
 * drag-and-drop, move-up/down button, and keyboard code paths.
 */

/** Return a new array with the item at `from` moved to `to`. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
