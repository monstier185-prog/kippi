import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

describe('EmptyState', () => {
  it('renders its title, description, and primary action', async () => {
    const onCreate = vi.fn();
    render(
      <EmptyState
        title="No portfolios yet"
        description="Create your first portfolio to get started."
        action={
          <Button variant="primary" onClick={onCreate}>
            Create portfolio
          </Button>
        }
      />,
    );

    expect(screen.getByText('No portfolios yet')).toBeInTheDocument();
    expect(
      screen.getByText(/create your first portfolio/i),
    ).toBeInTheDocument();

    const action = screen.getByRole('button', { name: 'Create portfolio' });
    await userEvent.click(action);
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
