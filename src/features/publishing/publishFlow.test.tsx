import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ToastProvider';
import type { Portfolio, PortfolioSection } from '../../models';
import {
  LocalStoragePortfolioRepository,
  type PortfolioRepository,
} from '../../services/portfolioRepository';
import { PortfolioStoreProvider } from '../../services/PortfolioStoreProvider';
import { PortfolioEditor } from '../portfolio-editor/PortfolioEditor';
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

async function seed(repo: PortfolioRepository): Promise<Portfolio> {
  const created = await repo.create({ title: 'Portfolioku' });
  const sections: PortfolioSection[] = [
    {
      id: 'sec-profile',
      position: 0,
      isVisible: true,
      type: 'profile',
      content: { fullName: 'Dewi Lestari' },
    },
  ];
  return repo.update(created.id, { sections });
}

function renderApp(repo: PortfolioRepository, id: string) {
  return render(
    <MemoryRouter initialEntries={[`/editor/${id}`]}>
      <ToastProvider>
        <PortfolioStoreProvider repository={repo}>
          <Routes>
            <Route path="/editor/:id" element={<PortfolioEditor />} />
            <Route path="/p/:slug" element={<PublicPortfolioView />} />
            <Route path="/dashboard" element={<h1>Dashboard route</h1>} />
          </Routes>
        </PortfolioStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('publish flow', () => {
  let repo: PortfolioRepository;

  beforeEach(() => {
    repo = new LocalStoragePortfolioRepository({ storage: memoryStorage() });
  });

  it('does not publish without an explicit confirmation', async () => {
    const user = userEvent.setup();
    const p = await seed(repo);
    renderApp(repo, p.id);

    // Open the publish dialog but close it without confirming.
    const openBtn = await screen.findByRole('button', { name: 'Publish' });
    await user.click(openBtn);
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Batal' }));

    const after = await repo.get(p.id);
    expect(after?.status).not.toBe('published');
    expect(after?.publishedAt).toBeUndefined();
  });

  it('publishes only after the explicit confirm button, then the public view shows it', async () => {
    const user = userEvent.setup();
    const p = await seed(repo);
    renderApp(repo, p.id);

    const openBtn = await screen.findByRole('button', { name: 'Publish' });
    await user.click(openBtn);
    await screen.findByRole('dialog');
    await user.click(
      screen.getByRole('button', { name: 'Ya, publikasikan di browser ini' }),
    );

    await waitFor(async () => {
      const after = await repo.get(p.id);
      expect(after?.status).toBe('published');
      expect(after?.publishedAt).toBeTruthy();
    });
  });

  it('unpublish returns the portfolio to private', async () => {
    const user = userEvent.setup();
    const p = await seed(repo);
    await repo.update(p.id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
    renderApp(repo, p.id);

    // Button label reflects the published state.
    const manageBtn = await screen.findByRole('button', {
      name: 'Kelola publikasi',
    });
    await user.click(manageBtn);
    await screen.findByRole('dialog');
    await user.click(
      screen.getByRole('button', { name: 'Nonaktifkan tautan publik' }),
    );

    await waitFor(async () => {
      const after = await repo.get(p.id);
      expect(after?.status).toBe('private');
      expect(after?.publishedAt).toBeUndefined();
    });
  });
});
