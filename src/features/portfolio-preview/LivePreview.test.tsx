import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LivePreview } from './LivePreview';
import { makePortfolio } from './testFixtures';

describe('LivePreview', () => {
  it('shows the draft/published status clearly', () => {
    const { rerender } = render(
      <LivePreview portfolio={makePortfolio()} status="draft" />,
    );
    expect(screen.getByText('Draft')).toBeInTheDocument();

    rerender(
      <LivePreview
        portfolio={makePortfolio({ status: 'published' })}
        status="published"
      />,
    );
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('offers device, mode, and zoom controls', async () => {
    const user = userEvent.setup();
    render(<LivePreview portfolio={makePortfolio()} status="draft" />);

    // Device switch
    const mobile = screen.getByRole('button', { name: 'Mobile' });
    expect(mobile).toHaveAttribute('aria-pressed', 'false');
    await user.click(mobile);
    expect(mobile).toHaveAttribute('aria-pressed', 'true');

    // CV / portfolio mode switch — switching to CV drops testimonials.
    expect(screen.getByText('Kolaborasi yang luar biasa.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'CV' }));
    expect(
      screen.queryByText('Kolaborasi yang luar biasa.'),
    ).not.toBeInTheDocument();

    // Zoom
    expect(screen.getByText('100%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Perbesar pratinjau' }));
    expect(screen.getByText('115%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Perkecil pratinjau' }));
    await user.click(screen.getByRole('button', { name: 'Perkecil pratinjau' }));
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});
