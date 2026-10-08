import { useContext } from 'react';
import {
  PortfolioStoreContext,
  type PortfolioStoreValue,
} from './portfolio-store-context';

/**
 * Access the portfolio store. Must be used inside a <PortfolioStoreProvider>;
 * throws a clear error otherwise so the misconfiguration surfaces early.
 */
export function usePortfolioStore(): PortfolioStoreValue {
  const ctx = useContext(PortfolioStoreContext);
  if (!ctx) {
    throw new Error(
      'usePortfolioStore must be used within a <PortfolioStoreProvider>',
    );
  }
  return ctx;
}

export default usePortfolioStore;
