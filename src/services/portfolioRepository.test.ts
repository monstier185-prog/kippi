import { beforeEach, describe, expect, it } from 'vitest';
import {
  LocalStoragePortfolioRepository,
  STORAGE_KEY,
  type PortfolioRepository,
} from './portfolioRepository';

/** A minimal in-memory Storage so each test runs against a clean, controlled store. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    setItem: (k, v) => {
      map.set(k, String(v));
    },
  };
}

describe('LocalStoragePortfolioRepository', () => {
  let repo: PortfolioRepository;
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    repo = new LocalStoragePortfolioRepository({ storage });
  });

  it('creates a portfolio with defaults and lists it', async () => {
    const created = await repo.create({ title: 'My CV' });
    expect(created.id).toBeTruthy();
    expect(created.title).toBe('My CV');
    expect(created.status).toBe('draft');
    expect(created.slug).toBe('my-cv');
    expect(created.sections).toEqual([]);

    const list = await repo.list();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it('creates no fake seed data for a fresh store', async () => {
    expect(await repo.list()).toEqual([]);
  });

  it('persists across repository instances (reload simulation)', async () => {
    const created = await repo.create({ title: 'Persisted' });
    // A brand-new repository over the same storage must see the record.
    const reopened = new LocalStoragePortfolioRepository({ storage });
    const fetched = await reopened.get(created.id);
    expect(fetched?.title).toBe('Persisted');
    expect(storage.getItem(STORAGE_KEY)).toContain('Persisted');
  });

  it('updates a portfolio and bumps updatedAt', async () => {
    const created = await repo.create({ title: 'Draft one' });
    await new Promise((r) => setTimeout(r, 2));
    const updated = await repo.update(created.id, { status: 'published' });
    expect(updated.status).toBe('published');
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
    // Protected fields never change via update.
    expect(updated.id).toBe(created.id);
    expect(updated.slug).toBe(created.slug);
    expect(updated.createdAt).toBe(created.createdAt);
  });

  it('generates unique, URL-safe slugs on collision', async () => {
    const a = await repo.create({ title: 'Senior Engineer!' });
    const b = await repo.create({ title: 'Senior Engineer!' });
    const c = await repo.create({ title: 'Senior Engineer!' });
    expect(a.slug).toBe('senior-engineer');
    expect(b.slug).toBe('senior-engineer-2');
    expect(c.slug).toBe('senior-engineer-3');
    // Every slug is URL-safe.
    for (const slug of [a.slug, b.slug, c.slug]) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('duplicates a portfolio with a new id, unique slug, and draft status', async () => {
    const source = await repo.update(
      (await repo.create({ title: 'Original' })).id,
      { status: 'published', publishedAt: new Date().toISOString() },
    );
    const copy = await repo.duplicate(source.id);

    expect(copy.id).not.toBe(source.id);
    expect(copy.slug).not.toBe(source.slug);
    expect(copy.title).toBe('Original (salinan)');
    // A duplicate always resets to a private draft.
    expect(copy.status).toBe('draft');
    expect(copy.publishedAt).toBeUndefined();

    const list = await repo.list();
    expect(list).toHaveLength(2);
  });

  it('soft-deletes: hides from list/get but retains the record', async () => {
    const created = await repo.create({ title: 'To delete' });
    await repo.delete(created.id);

    // Hidden from normal listing and get.
    expect(await repo.list()).toHaveLength(0);
    expect(await repo.get(created.id)).toBeNull();

    // Still retained and recoverable (soft delete, not a hard delete).
    const withDeleted = await repo.list({ includeDeleted: true });
    expect(withDeleted).toHaveLength(1);
    expect(withDeleted[0].deletedAt).toBeTruthy();

    const restored = await repo.restore(created.id);
    expect(restored.deletedAt).toBeUndefined();
    expect(await repo.list()).toHaveLength(1);
  });

  it('purge permanently removes a record', async () => {
    const created = await repo.create({ title: 'Gone soon' });
    await repo.delete(created.id);
    await repo.purge(created.id);
    expect(await repo.list({ includeDeleted: true })).toHaveLength(0);
  });

  it('renames a portfolio while keeping the slug stable', async () => {
    const created = await repo.create({ title: 'Old title' });
    const renamed = await repo.rename(created.id, '  New title  ');
    expect(renamed.title).toBe('New title');
    expect(renamed.slug).toBe(created.slug);
  });

  it('rejects an empty rename', async () => {
    const created = await repo.create({ title: 'Keep me' });
    await expect(repo.rename(created.id, '   ')).rejects.toThrow();
  });

  it('does not surface records owned by a different user (privacy rule)', async () => {
    const mine = new LocalStoragePortfolioRepository({
      storage,
      ownerId: 'user-a',
    });
    const theirs = new LocalStoragePortfolioRepository({
      storage,
      ownerId: 'user-b',
    });
    const a = await mine.create({ title: 'A private' });
    await theirs.create({ title: 'B private' });

    expect(await mine.list()).toHaveLength(1);
    expect((await mine.list())[0].id).toBe(a.id);
    // user-b cannot read user-a's record.
    expect(await theirs.get(a.id)).toBeNull();
  });
});
