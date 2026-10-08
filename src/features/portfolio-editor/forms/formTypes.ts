/**
 * Shared contract for every section form. A form receives the typed section it
 * edits, a change handler that returns the next section, and the current
 * field-error map (keyed by dotted path, see validation.ts). Forms are
 * controlled and never mutate the section in place.
 */
import type { PortfolioSection } from '../../../models';
import type { FieldErrors } from '../validation';

export interface SectionFormProps<T extends PortfolioSection = PortfolioSection> {
  section: T;
  onChange: (next: T) => void;
  errors: FieldErrors;
}

/** Narrow a PortfolioSection to a specific type for a form component. */
export type SectionOfType<K extends PortfolioSection['type']> = Extract<
  PortfolioSection,
  { type: K }
>;
