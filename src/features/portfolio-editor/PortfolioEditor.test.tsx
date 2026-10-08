import { render, screen, waitFor, within } from '@testing-library/react';
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
import { PortfolioEditor } from './PortfolioEditor';

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

function section(
  partial: Partial<PortfolioSection> & Pick<PortfolioSection, 'type'>,
  position: number,
): PortfolioSection {
  const base = {
    id: `sec-${partial.type}-${position}`,
    position,
    isVisible: true,
  };
  switch (partial.type) {
    case 'profile':
      return { ...base, type: 'profile', content: { fullName: '' } };
    case 'about':
      return { ...base, type: 'about', content: { body: '' } };
    case 'experience':
      return { ...base, type: 'experience', content: { items: [] } };
    case 'contact':
      return { ...base, type: 'contact', content: {} };
    case 'socialLinks':
      return { ...base, type: 'socialLinks', content: { items: [] } };
    default:
      return { ...base, type: 'about', content: { body: '' } };
  }
}

async function seedPortfolio(
  repo: PortfolioRepository,
  sections: PortfolioSection[],
): Promise<Portfolio> {
  const created = await repo.create({ title: 'Portfolioku' });
  return repo.update(created.id, { sections });
}

function renderEditor(repo: PortfolioRepository, id: string) {
  return render(
    <MemoryRouter initialEntries={[`/editor/${id}`]}>
      <ToastProvider>
        <PortfolioStoreProvider repository={repo}>
          <Routes>
            <Route path="/editor/:id" element={<PortfolioEditor />} />
            <Route path="/dashboard" element={<h1>Dashboard route</h1>} />
          </Routes>
        </PortfolioStoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('PortfolioEditor', () => {
  let repo: PortfolioRepository;

  beforeEach(() => {
    repo = new LocalStoragePortfolioRepository({ storage: memoryStorage() });
  });

  it('shows a not-found error state for a missing portfolio', async () => {
    renderEditor(repo, 'does-not-exist');
    expect(
      await screen.findByText('Portfolio tidak ditemukan'),
    ).toBeInTheDocument();
  });

  it('renders the section navigation, a live preview, and Editor/Preview tabs', async () => {
    const p = await seedPortfolio(repo, [section({ type: 'profile' }, 0)]);
    renderEditor(repo, p.id);

    // Section navigation and the live preview region are both present.
    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    expect(
      screen.getByRole('group', { name: 'Pratinjau langsung portfolio' }),
    ).toBeInTheDocument();

    // The Editor/Preview tabs exist for narrow screens. On the default jsdom
    // (desktop) width they are CSS-hidden, so query with { hidden: true }.
    const tabs = screen.getAllByRole('tab', { hidden: true });
    expect(tabs.map((t) => t.textContent)).toContain('Editor');
    expect(tabs.map((t) => t.textContent)).toContain('Preview');
  });

  it('editing a field updates the model and persists it', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [section({ type: 'profile' }, 0)]);
    renderEditor(repo, p.id);

    const nameInput = await screen.findByLabelText(/Nama lengkap/);
    await user.type(nameInput, 'Dewi Lestari');

    await waitFor(async () => {
      const saved = await repo.get(p.id);
      const profile = saved?.sections.find((s) => s.type === 'profile');
      expect(
        profile && profile.type === 'profile' ? profile.content.fullName : '',
      ).toBe('Dewi Lestari');
    });
  });

  it('shows an actionable validation error for an invalid required field', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [section({ type: 'profile' }, 0)]);
    renderEditor(repo, p.id);

    const nameInput = await screen.findByLabelText(/Nama lengkap/);
    // Required field left empty -> actionable error announced via role=alert.
    await user.click(nameInput);
    expect(
      await screen.findByText('Nama lengkap wajib diisi.'),
    ).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('reorders sections with the move-down button', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [
      section({ type: 'profile' }, 0),
      section({ type: 'about' }, 1),
    ]);
    renderEditor(repo, p.id);

    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    await user.click(
      screen.getByRole('button', { name: 'Pindah Profil ke bawah' }),
    );

    await waitFor(async () => {
      const saved = await repo.get(p.id);
      const ordered = [...(saved?.sections ?? [])].sort(
        (a, b) => a.position - b.position,
      );
      expect(ordered[0].type).toBe('about');
      expect(ordered[1].type).toBe('profile');
    });
  });

  it('reorders sections with the keyboard via the drag handle', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [
      section({ type: 'profile' }, 0),
      section({ type: 'about' }, 1),
    ]);
    renderEditor(repo, p.id);

    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    const handle = screen.getByRole('button', {
      name: /Ubah urutan: Profil/,
    });
    handle.focus();
    await user.keyboard('{ArrowDown}');

    await waitFor(async () => {
      const saved = await repo.get(p.id);
      const ordered = [...(saved?.sections ?? [])].sort(
        (a, b) => a.position - b.position,
      );
      expect(ordered[0].type).toBe('about');
    });
  });

  it('hides a section when the visibility toggle is used', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [section({ type: 'about' }, 0)]);
    renderEditor(repo, p.id);

    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    await user.click(
      screen.getByRole('button', { name: 'Sembunyikan Tentang' }),
    );

    await waitFor(async () => {
      const saved = await repo.get(p.id);
      const about = saved?.sections.find((s) => s.type === 'about');
      expect(about?.isVisible).toBe(false);
    });
  });

  it('asks for confirmation before deleting a section', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [section({ type: 'about' }, 0)]);
    renderEditor(repo, p.id);

    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    await user.click(screen.getByRole('button', { name: 'Hapus Tentang' }));

    // Confirmation dialog appears; the section is not yet removed.
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Hapus bagian ini?')).toBeInTheDocument();
    expect((await repo.get(p.id))?.sections).toHaveLength(1);

    await user.click(
      within(dialog).getByRole('button', { name: 'Hapus bagian' }),
    );
    await waitFor(async () => {
      expect((await repo.get(p.id))?.sections).toHaveLength(0);
    });
  });

  it('preserves unsaved input when switching sections', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [
      section({ type: 'profile' }, 0),
      section({ type: 'about' }, 1),
    ]);
    renderEditor(repo, p.id);

    const nameInput = await screen.findByLabelText(/Nama lengkap/);
    await user.type(nameInput, 'Budi');

    // Switch to the About section, then back to Profile.
    await user.click(screen.getByRole('button', { name: 'Buka bagian Tentang' }));
    await screen.findByLabelText(/Tentang kamu/);
    await user.click(
      screen.getByRole('button', { name: 'Buka bagian Profil' }),
    );

    // The previously-typed value is still there (not lost on switch).
    expect(await screen.findByLabelText(/Nama lengkap/)).toHaveValue('Budi');
  });

  it('warns with a Simpan / Buang / Batal dialog when leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, [section({ type: 'profile' }, 0)]);
    renderEditor(repo, p.id);

    const nameInput = await screen.findByLabelText(/Nama lengkap/);
    await user.type(nameInput, 'X');

    await user.click(screen.getByRole('button', { name: '← Kembali' }));

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByText('Simpan perubahan sebelum keluar?'),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Simpan' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Buang Perubahan' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Batal' }),
    ).toBeInTheDocument();
  });

  it('adds a new section via the add menu', async () => {
    const user = userEvent.setup();
    const p = await seedPortfolio(repo, []);
    renderEditor(repo, p.id);

    await screen.findByRole('navigation', { name: 'Bagian portfolio' });
    await user.click(screen.getByRole('button', { name: 'Tambah bagian' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Profil' }));

    await waitFor(async () => {
      const saved = await repo.get(p.id);
      expect(saved?.sections.some((s) => s.type === 'profile')).toBe(true);
    });
  });
});
