import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App landing', () => {
  it('renders the hero heading with the exact concrete copy', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /buat portfolio yang terlihat seperti dirimu/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders both hero CTAs', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Buat Portfolio' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Lihat Contoh' }),
    ).toBeInTheDocument();
  });

  it('renders the primary nav links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const primaryNav = screen.getByRole('navigation', { name: 'Utama' });
    expect(
      within(primaryNav).getByRole('link', { name: 'Cara kerja' }),
    ).toBeInTheDocument();
    expect(
      within(primaryNav).getByRole('link', { name: 'Contoh' }),
    ).toBeInTheDocument();
    expect(
      within(primaryNav).getByRole('link', { name: 'Masuk' }),
    ).toBeInTheDocument();
    expect(
      within(primaryNav).getByRole('link', { name: 'Buat Portfolio' }),
    ).toBeInTheDocument();
  });

  it('renders the footer links (Product · Privacy · Terms · Contact)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const footerNav = screen.getByRole('navigation', { name: 'Footer' });
    for (const name of ['Product', 'Privacy', 'Terms', 'Contact']) {
      expect(
        within(footerNav).getByRole('link', { name }),
      ).toBeInTheDocument();
    }
  });

  it('renders the NotFound fallback for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/does-not-exist']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /page not found/i }),
    ).toBeInTheDocument();
  });
});
