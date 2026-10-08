import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import { Button } from './Button';

function Trigger() {
  const { show } = useToast();
  return (
    <Button
      onClick={() => show({ title: 'Saved', message: 'Draft stored locally.' })}
    >
      Trigger
    </Button>
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('shows a toast on demand and lets the user dismiss it', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Draft stored locally.')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Dismiss notification' }),
    );
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });

  it('auto-dismisses after the default duration', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(screen.getByText('Saved')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
  });
});
