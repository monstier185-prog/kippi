/**
 * Minimal, dependency-free document <head> manager for the public view.
 *
 * The app is a client-side SPA with no SSR, so share/SEO metadata is set at
 * runtime: the public page sets a descriptive <title> and meta description from
 * the portfolio's `seoConfig`, and a `robots` directive so a private/draft page
 * (or an explicit `noindex`) is never indexed. Every value is normalized to
 * plain text first (see `toPlainText`) so nothing user-entered can break the
 * tag. The previous values are restored on unmount so navigating away from the
 * public page does not leak its title into the rest of the app.
 */
import { useEffect } from 'react';
import { toPlainText } from './sanitize';

export interface DocumentHeadOptions {
  title?: string;
  description?: string;
  /** When true, emit <meta name="robots" content="noindex,nofollow">. */
  noindex?: boolean;
}

function upsertMeta(name: string, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[name="${name}"]`,
  );
  const created = !el;
  const previous = el?.getAttribute('content') ?? null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return () => {
    if (!el) return;
    if (created) {
      el.remove();
    } else if (previous !== null) {
      el.setAttribute('content', previous);
    }
  };
}

export function useDocumentHead({
  title,
  description,
  noindex,
}: DocumentHeadOptions): void {
  const safeTitle = toPlainText(title);
  const safeDescription = toPlainText(description);

  useEffect(() => {
    const previousTitle = document.title;
    if (safeTitle) document.title = safeTitle;

    const cleanups: Array<() => void> = [];
    if (safeDescription) {
      cleanups.push(upsertMeta('description', safeDescription));
    }
    cleanups.push(
      upsertMeta('robots', noindex ? 'noindex,nofollow' : 'index,follow'),
    );

    return () => {
      document.title = previousTitle;
      for (const cleanup of cleanups) cleanup();
    };
  }, [safeTitle, safeDescription, noindex]);
}

export default useDocumentHead;
