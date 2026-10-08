import { createContext } from 'react';
import type { Portfolio, SaveState } from '../models';
import type {
  CreatePortfolioInput,
  PortfolioPatch,
  PortfolioRepository,
} from './portfolioRepository';

/**
 * Value exposed by the portfolio store. It wraps the repository so the UI gets
 * React-friendly, state-aware operations plus the current `saveState`. The
 * underlying repository is swappable (see portfolioRepository.ts); the store
 * does not care which implementation it holds.
 */
export interface PortfolioStoreValue {
  /** The portfolios currently loaded (excludes soft-deleted records). */
  portfolios: Portfolio[];
  /** True while the initial load is in flight. */
  loading: boolean;
  /** Current persistence state, surfaced for save indicators. */
  saveState: SaveState;
  /** The last error message, if any operation failed. */
  error: string | null;
  /** Re-read portfolios from the repository. */
  refresh: () => Promise<void>;
  create: (input?: CreatePortfolioInput) => Promise<Portfolio>;
  update: (id: string, patch: PortfolioPatch) => Promise<Portfolio>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<Portfolio>;
  rename: (id: string, title: string) => Promise<Portfolio>;
  /** Direct access to the repository for advanced callers (e.g. the editor). */
  repository: PortfolioRepository;
}

export const PortfolioStoreContext = createContext<PortfolioStoreValue | null>(
  null,
);
