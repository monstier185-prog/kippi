/**
 * The honest local-first publish model (spec Sesi 7 + Section 11.2).
 *
 * There is NO server. "Publishing" does not upload anything or create a live
 * hosted URL — it flips a portfolio's status to `published` IN THIS BROWSER so
 * the `/p/:slug` route will render it. A draft/private portfolio must never be
 * viewable through the public renderer. These helpers centralize that rule so
 * the public view, the editor, and the tests all agree on exactly one
 * definition of "is this allowed to be shown publicly".
 */
import type { Portfolio, PublicationStatus } from '../../models';

/** True only when a portfolio is explicitly published (and not soft-deleted). */
export function isPubliclyViewable(portfolio: Portfolio): boolean {
  return portfolio.status === 'published' && !portfolio.deletedAt;
}

/** The patch applied when a user explicitly publishes a portfolio. */
export function publishPatch(now: string = new Date().toISOString()): {
  status: PublicationStatus;
  publishedAt: string;
} {
  return { status: 'published', publishedAt: now };
}

/**
 * The patch applied when a user disables the public link. We return the
 * portfolio to `private` (not `draft`) so "unpublish" reads as "no longer
 * shareable", and clear `publishedAt`.
 */
export function unpublishPatch(): {
  status: PublicationStatus;
  publishedAt: undefined;
} {
  return { status: 'private', publishedAt: undefined };
}

/** The local path a published portfolio is reachable at (this browser only). */
export function publicPath(slug: string): string {
  return `/p/${slug}`;
}

/**
 * The full local URL shown to the user. It is honestly described in the UI as
 * local-to-this-browser, never as a live hosted link. Falls back to a relative
 * path when there is no `window` (tests / SSR).
 */
export function publicUrl(slug: string): string {
  const path = publicPath(slug);
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
