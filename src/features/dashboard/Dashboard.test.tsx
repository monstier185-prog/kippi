import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../components/ToastProvider';
import {
  LocalStoragePortfolioRepository,
  type PortfolioRepository,
} from '../../services/portfolioRepository';
import { PortfolioStoreProvider } from '../../services/PortfolioStoreProvider';
import { Dashboard } from './Dashboard';

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

function renderDashboard(repository: PortfolioRepository) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <ToastProvider>
        <PortfolioStoreProvider repository={repository}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/editor/:id"
              element={<h1>Editor route</h1>}
            />
          </Routes>
        </PortfolioStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
  let repo: PortfolioRepository;

  beforeEach(() => {
    repo = new LocalStoragePortfolioRepository({ storage: memoryStorage() });
  });

  it('renders the exact empty-state copy when there are no portfolios', async () => {
    renderDashboard(repo);
    expect(
      await screen.findByText('Belum ada portfolio'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mulai dari profil, pengalaman, atau satu project terbaikmu.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Buat Portfolio Pertama' }),
    ).toBeInTheDocument();
  });

  it('shows no fabricated analytics or stat widgets', async () => {
    renderDashboard(repo);
    await screen.findByText('Belum ada portfolio');
    // No percentage/views/visitor style fake metrics anywhere.
    expect(screen.queryByText(/views|visitor|pengunjung|%/i)).toBeNull();
  });

  it('creates a portfolio and navigates to the editor', async () => {
    const user = userEvent.setup();
    renderDashboard(repo);

    const createButton = await screen.findByRole('button', {
      name: 'Buat Portfolio Pertama',
    });
    await user.click(createButton);

    // Navigation lands on the editor route for the newly created portfolio.
    expect(
      await screen.findByRole('heading', { name: 'Editor route' }),
    ).toBeInTheDocument();

    // And the portfolio was actually persisted via the repository.
    const list = await repo.list();
    expect(list).toHaveLength(1);
  });

  it('lists existing portfolios with status and last-edited date', async () => {
    await repo.create({ title: 'Portfolio Satu' });
    renderDashboard(repo);

    expect(
      await screen.findByRole('heading', { name: 'Portfolio Satu' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText(/Diubah/)).toBeInTheDocument();
  });

  it('requires confirmation before deleting and does not delete silently', async () => {
    const user = userEvent.setup();
    const created = await repo.create({ title: 'Hapus aku' });
    renderDashboard(repo);

    await screen.findByRole('heading', { name: 'Hapus aku' });

    // Open the per-item action menu and choose Delete.
    await user.click(
      screen.getByRole('button', { name: 'Aksi untuk Hapus aku' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

    // A confirmation dialog appears; nothing is deleted yet.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Hapus portfolio?')).toBeInTheDocument();
    expect(await repo.get(created.id)).not.toBeNull();

    // Confirm deletion.
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }));

    await waitFor(async () => {
      expect(await repo.get(created.id)).toBeNull();
    });
  });

  it('renames a portfolio through the rename dialog', async () => {
    const user = userEvent.setup();
    const created = await repo.create({ title: 'Nama lama' });
    renderDashboard(repo);

    await screen.findByRole('heading', { name: 'Nama lama' });
    await user.click(
      screen.getByRole('button', { name: 'Aksi untuk Nama lama' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    const dialog = await screen.findByRole('dialog');
    const input = within(dialog).getByLabelText(/Judul/);
    await user.clear(input);
    await user.type(input, 'Nama baru');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan' }));

    await waitFor(async () => {
      expect((await repo.get(created.id))?.title).toBe('Nama baru');
    });
  });

  it('cancelling the delete dialog keeps the portfolio', async () => {
    const user = userEvent.setup();
    const created = await repo.create({ title: 'Jangan hapus' });
    renderDashboard(repo);

    await screen.findByRole('heading', { name: 'Jangan hapus' });
    await user.click(
      screen.getByRole('button', { name: 'Aksi untuk Jangan hapus' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Batal' }));

    expect(await repo.get(created.id)).not.toBeNull();
  });
});
