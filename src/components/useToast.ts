import { useContext } from 'react';
import { ToastContext, type ToastContextValue } from './toast-context';

/**
 * Access the toast API. Must be used inside a <ToastProvider>; throws a clear
 * error otherwise so the misconfiguration is caught during development.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

export default useToast;
