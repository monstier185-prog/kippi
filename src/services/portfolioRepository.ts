/**
 * Portfolio persistence abstraction (local-first).
 *
 * `PortfolioRepository` is the single boundary between the UI and storage. The
 * app depends only on this interface, so a future server-backed implementation
 * (REST/GraphQL/Supabase/etc.) can be dropped in without touching the UI — it
 * only has to satisfy the same contract. The shipped implementation,
 * `LocalStoragePortfolioRepository`, persists to `window.localStorage` under a
 * single versioned namespace key.
 *
 * Data rules honored at the local level (spec Section 10.1):
 *  - Every portfolio has an `ownerId`; there is one conceptual local user.
 *  - A repository is scoped to its owner. `list`/`get` never return records
 *    belonging to a different owner, so one user cannot read another's data
 *    (the private-not-readable rule, enforced honestly even without a server).
 *  - `delete` is a SOFT delete: it sets `deletedAt` and hides the record from
 *    normal listings while retaining it until `purge`/`emptyTrash`.
 *  - Slugs are unique and URL-safe across non-deleted portfolios.
 *
 * No fake seed data is ever created.
 */
import type { Portfolio, PublicationStatus, ThemeConfig, SeoConfig } from '../models';
import { portfolioSchema } from '../models';
import { createId } from '../lib/id';
import { uniqueSlug } from '../lib/slug';

/** The single conceptual local user that owns data in this browser. */
export const LOCAL_OWNER_ID = 'local-user';

/** Versioned namespace key. Bump the version if the persisted shape changes. */
export const STORAGE_KEY = 'mystreet.portfolios.v1';

/** Input for creating a portfolio. Everything is optional with sensible defaults. */
export interface CreatePortfolioInput {
  title?: string;
  templateId?: string;
  status?: PublicationStatus;
  themeConfig?: Partial<ThemeConfig>;
  seoConfig?: Partial<SeoConfig>;
}

/** Fields a caller may patch via `update`. Identity/owner/slug are protected. */
export type PortfolioPatch = Partial<
  Omit<Portfolio, 'id' | 'ownerId' | 'slug' | 'createdAt'>
>;

/** Options for listing portfolios. */
export interface ListOptions {
  /** Include soft-deleted records (default false). */
  includeDeleted?: boolean;
}

export interface PortfolioRepository {
  /** List portfolios owned by the current owner, newest-updated first. */
  list(options?: ListOptions): Promise<Portfolio[]>;
  /** Get one portfolio by id, or null if missing / soft-deleted / not owned. */
  get(id: string): Promise<Portfolio | null>;
  /** Create a new portfolio with a unique slug and return it. */
  create(input?: CreatePortfolioInput): Promise<Portfolio>;
  /** Patch an existing portfolio and bump `updatedAt`. */
  update(id: string, patch: PortfolioPatch): Promise<Portfolio>;
  /** Soft-delete a portfolio (sets `deletedAt`; retained, hidden from lists). */
  delete(id: string): Promise<void>;
  /** Restore a soft-deleted portfolio. */
  restore(id: string): Promise<Portfolio>;
  /** Permanently remove a soft-deleted portfolio. */
  purge(id: string): Promise<void>;
  /** Duplicate a portfolio (new id + unique slug, status reset to draft). */
  duplicate(id: string): Promise<Portfolio>;
  /** Rename a portfolio's title (slug is left stable to keep links working). */
  rename(id: string, title: string): Promise<Portfolio>;
}

const DEFAULT_TEMPLATE_ID = 'editorial';

function defaultTheme(templateId: string): ThemeConfig {
  return { templateId, palette: 'navy', fontScale: 'comfortable' };
}

function nowIso(): string {
  return new Date().toISOString();
}

/** localStorage-backed repository. All reads validate against the zod schema. */
export class LocalStoragePortfolioRepository implements PortfolioRepository {
  private readonly ownerId: string;
  private readonly storage: Storage;
  private readonly key: string;

  constructor(options?: {
    ownerId?: string;
    storage?: Storage;
    key?: string;
  }) {
    this.ownerId = options?.ownerId ?? LOCAL_OWNER_ID;
    this.key = options?.key ?? STORAGE_KEY;
    const storage = options?.storage ?? safeLocalStorage();
    if (!storage) {
      throw new Error(
        'LocalStoragePortfolioRepository requires a Storage implementation (localStorage is unavailable).',
      );
    }
    this.storage = storage;
  }

  /** Read + validate every stored record, regardless of owner. */
  private readRaw(): Portfolio[] {
    const raw = this.storage.getItem(this.key);
    if (!raw) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Corrupt payload: fail safe to an empty set rather than throwing.
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    const result: Portfolio[] = [];
    for (const entry of parsed) {
      const check = portfolioSchema.safeParse(entry);
      if (check.success) result.push(check.data);
    }
    return result;
  }

  /**
   * Read only the records owned by this repository's owner. One owner can never
   * read another's data through this method (the privacy rule).
   */
  private readAll(): Portfolio[] {
    return this.readRaw().filter((p) => p.ownerId === this.ownerId);
  }

  /**
   * Persist the owner's records. Records belonging to other owners are read
   * back from storage and preserved untouched, so an owner-scoped repository
   * never clobbers another owner's data.
   */
  private writeAll(ownRecords: Portfolio[]): void {
    const others = this.readRaw().filter((p) => p.ownerId !== this.ownerId);
    this.storage.setItem(this.key, JSON.stringify([...others, ...ownRecords]));
  }

  private findIndexOrThrow(records: Portfolio[], id: string): number {
    const index = records.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Portfolio not found: ${id}`);
    }
    return index;
  }

  async list(options?: ListOptions): Promise<Portfolio[]> {
    const records = this.readAll().filter(
      (p) => options?.includeDeleted || !p.deletedAt,
    );
    return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async get(id: string): Promise<Portfolio | null> {
    const record = this.readAll().find((p) => p.id === id);
    if (!record || record.deletedAt) return null;
    return record;
  }

  async create(input?: CreatePortfolioInput): Promise<Portfolio> {
    const records = this.readAll();
    const templateId = input?.templateId ?? DEFAULT_TEMPLATE_ID;
    const title = (input?.title ?? '').trim() || 'Portfolio tanpa judul';
    const slug = uniqueSlug(
      title,
      records.filter((p) => !p.deletedAt).map((p) => p.slug),
    );
    const timestamp = nowIso();
    const portfolio: Portfolio = {
      id: createId(),
      ownerId: this.ownerId,
      slug,
      title,
      status: input?.status ?? 'draft',
      templateId,
      themeConfig: { ...defaultTheme(templateId), ...input?.themeConfig },
      seoConfig: { ...input?.seoConfig },
      sections: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    records.push(portfolio);
    this.writeAll(records);
    return portfolio;
  }

  async update(id: string, patch: PortfolioPatch): Promise<Portfolio> {
    const records = this.readAll();
    const index = this.findIndexOrThrow(records, id);
    const next: Portfolio = {
      ...records[index],
      ...patch,
      // Protect identity-level fields regardless of the patch contents.
      id: records[index].id,
      ownerId: records[index].ownerId,
      slug: records[index].slug,
      createdAt: records[index].createdAt,
      updatedAt: nowIso(),
    };
    records[index] = next;
    this.writeAll(records);
    return next;
  }

  async delete(id: string): Promise<void> {
    const records = this.readAll();
    const index = this.findIndexOrThrow(records, id);
    // Soft delete: retain the record, mark it deleted, hide it from listings.
    records[index] = { ...records[index], deletedAt: nowIso() };
    this.writeAll(records);
  }

  async restore(id: string): Promise<Portfolio> {
    const records = this.readAll();
    const index = this.findIndexOrThrow(records, id);
    const { deletedAt: _deletedAt, ...rest } = records[index];
    void _deletedAt;
    const restored: Portfolio = { ...rest, updatedAt: nowIso() };
    records[index] = restored;
    this.writeAll(records);
    return restored;
  }

  async purge(id: string): Promise<void> {
    const records = this.readAll().filter((p) => p.id !== id);
    this.writeAll(records);
  }

  async duplicate(id: string): Promise<Portfolio> {
    const records = this.readAll();
    const source = records.find((p) => p.id === id && !p.deletedAt);
    if (!source) {
      throw new Error(`Portfolio not found: ${id}`);
    }
    const title = `${source.title} (salinan)`;
    const slug = uniqueSlug(
      title,
      records.filter((p) => !p.deletedAt).map((p) => p.slug),
    );
    const timestamp = nowIso();
    const copy: Portfolio = {
      ...structuredCloneSafe(source),
      id: createId(),
      slug,
      title,
      // A duplicate always starts life as a private draft, never published.
      status: 'draft',
      publishedAt: undefined,
      deletedAt: undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    records.push(copy);
    this.writeAll(records);
    return copy;
  }

  async rename(id: string, title: string): Promise<Portfolio> {
    const trimmed = title.trim();
    if (!trimmed) {
      throw new Error('Judul tidak boleh kosong');
    }
    return this.update(id, { title: trimmed });
  }
}

/** Deep clone that works under jsdom (structuredClone may be undefined). */
function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Return window.localStorage if usable, otherwise null (SSR / blocked). */
function safeLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Access can throw when storage is disabled by the browser.
  }
  return null;
}
