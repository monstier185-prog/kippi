import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from './Dialog';
import { Button } from './Button';

function Harness({ onClose }: { onClose: () => void }) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="Confirm delete"
      description="This cannot be undone."
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="danger">Delete</Button>
        </>
      }
    >
      <Button>First focusable</Button>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('exposes dialog semantics and a labelled title', () => {
    render(<Harness onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      screen.getByRole('heading', { name: 'Confirm delete' }),
    ).toBeInTheDocument();
  });

  it('traps focus so Tab from the last element wraps to the first', async () => {
    render(<Harness onClose={() => {}} />);

    // Focus starts inside the dialog on the first focusable (the close button).
    const closeButton = screen.getByRole('button', { name: 'Close dialog' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });

    expect(document.activeElement).toBe(closeButton);

    // Tabbing forward from the last focusable wraps back to the first.
    deleteButton.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab from the first wraps to the last.
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(deleteButton);
  });
});
