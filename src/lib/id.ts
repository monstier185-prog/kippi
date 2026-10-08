/**
 * Generate a reasonably unique id for local records. Prefers the platform
 * `crypto.randomUUID` when available (browsers and modern jsdom) and falls back
 * to a timestamp + random suffix otherwise. Ids are opaque; nothing relies on
 * their format.
 */
export function createId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
