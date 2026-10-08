import { createContext } from 'react';

export type ToastVariant = 'info' | 'success' | 'error';

export interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Pass 0 to keep until dismissed. */
  duration?: number;
}

export interface ToastRecord extends Required<Omit<ToastOptions, 'message'>> {
  id: string;
  message?: string;
}

export interface ToastContextValue {
  /** Show a toast; returns its id so callers can dismiss it programmatically. */
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
