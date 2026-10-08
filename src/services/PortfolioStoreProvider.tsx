import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Portfolio, SaveState } from '../models';
import {
  LocalStoragePortfolioRepository,
  type CreatePortfolioInput,
  type PortfolioPatch,
  type PortfolioRepository,
} from './portfolioRepository';
import {
  PortfolioStoreContext,
  type PortfolioStoreValue,
} from './portfolio-store-context';

export interface PortfolioStoreProviderProps {
  children: ReactNode;
  /**
   * Repository implementation. Defaults to the localStorage repo; tests pass a
   * repository backed by a controlled Storage so behavior is deterministic.
   */
  repository?: PortfolioRepository;
}

/**
 * App-level store built on React context. It keeps the loaded portfolio list in
 * state, exposes repository operations that keep that list in sync, and tracks
 * a single `saveState`. Intentionally lightweight — no external state library.
 */
export function PortfolioStoreProvider({
  children,
  repository,
}: PortfolioStoreProviderProps) {
  // Create the default repository once; a provided repository wins.
  const repoRef = useRef<PortfolioRepository | null>(null);
  if (repoRef.current === null) {
    repoRef.current = repository ?? new LocalStoragePortfolioRepository();
  }
  const repo = repository ?? repoRef.current;

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const list = await repo.list();
    setPortfolios(list);
  }, [repo]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    repo
      .list()
      .then((list) => {
        if (active) setPortfolios(list);
      })
      .catch((err: unknown) => {
        if (active) setError(toMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [repo]);

  /** Run a write op, tracking saveState and refreshing the list afterwards. */
  const run = useCallback(
    async <T,>(op: () => Promise<T>): Promise<T> => {
      setSaveState('saving');
      setError(null);
      try {
        const result = await op();
        await refresh();
        setSaveState('saved');
        return result;
      } catch (err) {
        setSaveState('error');
        setError(toMessage(err));
        throw err;
      }
    },
    [refresh],
  );

  const create = useCallback(
    (input?: CreatePortfolioInput) => run(() => repo.create(input)),
    [repo, run],
  );
  const update = useCallback(
    (id: string, patch: PortfolioPatch) => run(() => repo.update(id, patch)),
    [repo, run],
  );
  const remove = useCallback(
    (id: string) => run(() => repo.delete(id)),
    [repo, run],
  );
  const duplicate = useCallback(
    (id: string) => run(() => repo.duplicate(id)),
    [repo, run],
  );
  const rename = useCallback(
    (id: string, title: string) => run(() => repo.rename(id, title)),
    [repo, run],
  );

  const value = useMemo<PortfolioStoreValue>(
    () => ({
      portfolios,
      loading,
      saveState,
      error,
      refresh,
      create,
      update,
      remove,
      duplicate,
      rename,
      repository: repo,
    }),
    [
      portfolios,
      loading,
      saveState,
      error,
      refresh,
      create,
      update,
      remove,
      duplicate,
      rename,
      repo,
    ],
  );

  return (
    <PortfolioStoreContext.Provider value={value}>
      {children}
    </PortfolioStoreContext.Provider>
  );
}

function toMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga.';
}

export default PortfolioStoreProvider;
