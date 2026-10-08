/**
 * URL-safe slug generation.
 *
 * `slugify` produces a lowercase, hyphenated, ASCII-only string safe to place
 * in a path segment. `uniqueSlug` adds a numeric suffix when a base slug
 * collides with an existing one, so slugs stay unique within the repository
 * (spec Section 10.1: "slug unik dan aman").
 */

/** Convert arbitrary text into a URL-safe slug. Falls back to "portfolio". */
export function slugify(input: string): string {
  const base = input
    .normalize('NFKD')
    // Strip diacritic marks left behind by the decomposition above.
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    // Anything that is not a-z, 0-9 becomes a separator.
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse and trim separator runs.
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return base || 'portfolio';
}

/**
 * Return a slug derived from `desired` that is not present in `taken`.
 * On collision a `-2`, `-3`, … suffix is appended until the slug is free.
 */
export function uniqueSlug(desired: string, taken: Iterable<string>): string {
  const base = slugify(desired);
  const used = new Set(taken);
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
