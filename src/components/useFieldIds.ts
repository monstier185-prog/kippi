import { useId } from 'react';

export interface FieldIds {
  controlId: string;
  hintId: string;
  errorId: string;
  /** aria-describedby value, or undefined when there is nothing to describe. */
  describedBy: string | undefined;
}

/**
 * Generates stable, linked ids for a labelled form control plus its optional
 * hint and error text, and assembles the matching `aria-describedby`. An error
 * takes precedence over the hint (which is why the hint is not rendered while
 * an error is present), so only the error id is linked when both are set.
 */
export function useFieldIds(options: {
  id?: string;
  hasHint: boolean;
  hasError: boolean;
}): FieldIds {
  const generated = useId();
  const controlId = options.id ?? generated;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const describedBy = options.hasError
    ? errorId
    : options.hasHint
      ? hintId
      : undefined;
  return { controlId, hintId, errorId, describedBy };
}
