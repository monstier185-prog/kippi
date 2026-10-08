import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton } from './IconButton';

// A tiny decorative icon used by the tests.
const Icon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 4l8 8" stroke="currentColor" />
  </svg>
);

describe('IconButton', () => {
  it('forwards the required aria-label as the accessible name', () => {
    render(
      <IconButton aria-label="Delete section">
        <Icon />
      </IconButton>,
    );

    // The button is findable by its accessible name, proving the label wires up.
    expect(
      screen.getByRole('button', { name: 'Delete section' }),
    ).toBeInTheDocument();
  });

  it('invokes its click handler', async () => {
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Add item" onClick={onClick}>
        <Icon />
      </IconButton>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
