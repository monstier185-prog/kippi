import type { PublicationStatus } from '../../models';

/** Indonesian labels for each publication status (spec Section 5.2). */
export const STATUS_LABEL: Record<PublicationStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  private: 'Private',
};

/**
 * Format an ISO timestamp as a short, human last-edited date. Falls back to the
 * raw string if the date cannot be parsed, so nothing is ever fabricated.
 */
export function formatLastEdited(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
