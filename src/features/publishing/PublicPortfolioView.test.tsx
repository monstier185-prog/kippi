import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ToastProvider';
import {
  LocalStoragePortfolioRepository,
  type PortfolioRepository,
} from '../../services/portfolioRepository';
import { PortfolioStoreProvider } from '../../services/PortfolioStoreProvider';
import type { Portfolio, PortfolioSection, PublicationStatus } from '../../models';
import { PublicPortfolioView } from './PublicPortfolioView';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    key: (i) => Array.from(map.keys())[i] ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    setItem: (k, v) => {
      map.set(k, String(v));
    },
  };
}

function profileSection(fullName: string, extra?: Partial<PortfolioSection>): PortfolioSection {
  return {
    id: 'sec-profile',
    position: 0,
    isVisible: true,
    type: 'profile',
    content: { fullName },
    ...(extra as object),
  } as PortfolioSection;
}

async function seed(
  repo: PortfolioRepository,
  status: PublicationStatus,
  sections: PortfolioSection[],
  overrides?: Partial<Portfolio>,
): Promise<Portfolio> {
  const created = await repo.create({ title: 'Portfolio' });
  return repo.update(created.id, { status, sections, ...overrides });
}

function renderPublic(repo: PortfolioRepository, slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/p/${slug}`]}>
      <ToastProvider>
        <PortfolioStoreProvider repository={repo}>
          <Routes>
            <Route path="/p/:slug" element={<PublicPortfolioView />} />
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Routes>
        </PortfolioStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('PublicPortfolioView', () => {
  let repo: PortfolioRepository;

  beforeEach(() => {
    repo = new LocalStoragePortfolioRepository({ storage: memoryStorage() });
  });

  it('renders a published portfolio by slug', async () => {
    const p = await seed(repo, 'published', [profileSection('Dewi Lestari')]);
    renderPublic(repo, p.slug);
    expect(await screen.findByText('Dewi Lestari')).toBeInTheDocument();
  });

  it('does NOT render a draft portfolio through the public route', async () => {
    const p = await seed(repo, 'draft', [profileSection('Rahasia Draft')]);
    renderPublic(repo, p.slug);
    expect(
      await screen.findByText('Portfolio ini tidak tersedia'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Rahasia Draft')).not.toBeInTheDocument();
  });

  it('does NOT render a private portfolio through the public route', async () => {
    const p = await seed(repo, 'private', [profileSection('Rahasia Privat')]);
    renderPublic(repo, p.slug);
    expect(
      await screen.findByText('Portfolio ini tidak tersedia'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Rahasia Privat')).not.toBeInTheDocument();
  });

  it('stops rendering once a portfolio is unpublished (status back to private)', async () => {
    const p = await seed(repo, 'published', [profileSection('Dewi Lestari')]);
    await repo.update(p.id, { status: 'private', publishedAt: undefined });
    renderPublic(repo, p.slug);
    expect(
      await screen.findByText('Portfolio ini tidak tersedia'),
    ).toBeInTheDocument();
  });

  it('escapes user content containing HTML/script (no injection)', async () => {
    const payload = '<img src=x onerror="alert(1)">hack';
    const sections: PortfolioSection[] = [
      profileSection('<script>alert(1)</script>Dewi'),
      {
        id: 'sec-about',
        position: 1,
        isVisible: true,
        type: 'about',
        content: { body: payload },
      },
    ];
    const p = await seed(repo, 'published', sections);
    const { container } = renderPublic(repo, p.slug);
    await screen.findByText(/Dewi/);
    // The malicious markup must be rendered as text, not as live DOM nodes.
    expect(container.querySelector('img[onerror]')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText(payload)).toBeInTheDocument();
  });

  it('neutralizes a javascript: URL in a social link', async () => {
    const sections: PortfolioSection[] = [
      profileSection('Dewi Lestari'),
      {
        id: 'sec-social',
        position: 1,
        isVisible: true,
        type: 'socialLinks',
        content: {
          items: [
            { id: 's1', label: 'Jahat', url: 'javascript:alert(1)' },
            { id: 's2', label: 'Aman', url: 'https://example.com' },
          ],
        },
      },
    ];
    const p = await seed(repo, 'published', sections);
    const { container } = renderPublic(repo, p.slug);
    await screen.findByText('Dewi Lestari');
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).not.toContain('javascript:alert(1)');
    expect(hrefs).toContain('https://example.com');
    // The unsafe link's label is still shown, just not clickable.
    expect(screen.getByText('Jahat')).toBeInTheDocument();
  });

  // (title / banner tests below)

  it('sets a descriptive document title from the published portfolio', async () => {
    const p = await seed(repo, 'published', [profileSection('Dewi Lestari')], {
      seoConfig: { title: 'Dewi — Product Designer' },
    });
    renderPublic(repo, p.slug);
    await screen.findByText('Dewi Lestari');
    await waitFor(() =>
      expect(document.title).toBe('Dewi — Product Designer — MyStreet.id'),
    );
  });

  it('shows the honest local-only banner (not a hosted URL)', async () => {
    const p = await seed(repo, 'published', [profileSection('Dewi Lestari')]);
    renderPublic(repo, p.slug);
    await screen.findByText('Dewi Lestari');
    expect(
      screen.getByText(/dibaca dari penyimpanan browser ini, bukan dari server/i),
    ).toBeInTheDocument();
  });
});
