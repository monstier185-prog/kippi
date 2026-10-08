/**
 * Output sanitization helpers (spec Section 11.1 / Sesi 9).
 *
 * MyStreet.id renders ALL user text as React children, which React escapes by
 * default — the app NEVER uses `dangerouslySetInnerHTML` with user input and
 * NEVER calls `eval` / `new Function`. So the main injection surface that is
 * not already covered by React is **URL attributes** (`href`, `src`): a value
 * like `javascript:alert(1)` is not HTML, so React will not neutralize it, yet
 * it executes if placed in an `href`. These helpers close that gap.
 *
 * We intentionally do NOT pull in a full HTML sanitizer (DOMPurify): there is
 * no rich-text/HTML field in the model — every user field is plain text. If a
 * rich-text field is ever added, route it through DOMPurify here (documented in
 * docs/SECURITY_REVIEW.md) rather than rendering raw HTML.
 */

/** URL schemes that are safe to place in a link `href`. */
const SAFE_LINK_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'] as const;

/** Dangerous schemes that must never reach an `href`/`src`. */
const DANGEROUS_SCHEME = /^\s*(javascript|vbscript|file):/i;

/**
 * Return a safe `href` for a user-supplied link, or `undefined` if the value
 * cannot be trusted. Relative URLs are allowed; absolute URLs must use a
 * safe scheme. `javascript:` / `vbscript:` / `data:` / `file:` are rejected.
 */
export function safeUrl(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (DANGEROUS_SCHEME.test(trimmed)) return undefined;
  // `data:` is rejected for links (phishing / script data URLs). Images use
  // `safeImageUrl` instead, which allows a constrained set of data URLs.
  if (/^\s*data:/i.test(trimmed)) return undefined;

  // A scheme-relative or relative URL (no scheme) is allowed as-is.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    return (SAFE_LINK_SCHEMES as readonly string[]).includes(url.protocol)
      ? trimmed
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build a safe `mailto:` href for a user-supplied email address, or
 * `undefined` if the value cannot be trusted. This keeps the contact email on
 * the same allow-list path as every other user href: the local-part/domain are
 * validated to a conservative shape and the whole value is percent-encoded so
 * no `?`-prefixed mail headers (cc/bcc/body) or control characters can be
 * smuggled into the link, then run through `safeUrl` as a final gate.
 */
export function safeMailto(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  // Conservative single-address shape: no spaces, exactly one `@`, a dotted
  // domain. Rejects anything with mailto header separators (`?`, newlines).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return undefined;
  // Encode the address so reserved URL characters cannot alter the href,
  // keeping `@` and `.` (valid, expected in a mailto address) unescaped, then
  // route through the shared allow-list so `mailto:` is validated uniformly.
  const encoded = encodeURIComponent(trimmed)
    .replace(/%40/g, '@')
    .replace(/%2E/gi, '.');
  return safeUrl(`mailto:${encoded}`);
}

/** Image data-URL mime types we accept inline (matches the upload allow-list). */
const SAFE_IMAGE_DATA = /^data:image\/(png|jpeg|jpg|gif|webp|avif);base64,/i;

/**
 * Return a safe `src` for a user-supplied image, or `undefined`. Allows http(s)
 * and relative URLs, plus a constrained set of base64 image data URLs (so a
 * locally-uploaded image stored as a data URL still renders). Rejects
 * `javascript:` and non-image data URLs.
 */
export function safeImageUrl(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (DANGEROUS_SCHEME.test(trimmed)) return undefined;
  if (/^\s*data:/i.test(trimmed)) {
    return SAFE_IMAGE_DATA.test(trimmed) ? trimmed : undefined;
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? trimmed
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Collapse any user text to a single trimmed line, safe for use in document
 * metadata (title / meta description) where line breaks and control chars are
 * undesirable. React still escapes it on render; this only normalizes it.
 */
export function toPlainText(value: string | undefined | null): string {
  if (!value) return '';
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    // Drop C0 control chars and DEL; keep everything else.
    out += code < 0x20 || code === 0x7f ? ' ' : ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}
