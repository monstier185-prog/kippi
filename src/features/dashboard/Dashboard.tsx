import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { EmptyState } from '../../components/EmptyState';
import { Input } from '../../components/Input';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../components/useToast';
import type { Portfolio } from '../../models';
import { portfolioTitleSchema } from '../../models';
import { usePortfolioStore } from '../../services/usePortfolioStore';
import { PortfolioCard } from './PortfolioCard';
import styles from './Dashboard.module.css';

/**
 * Dashboard (spec Section 5.2). Lists the portfolios held by the local
 * repository with their real status, last-edited date, and a thumbnail, plus a
 * per-item action menu (open / duplicate / rename / delete). Creating a
 * portfolio persists it via the repository and routes to the editor.
 *
 * There are no fabricated analytics or stat widgets anywhere on this screen.
 * Destructive actions always require explicit confirmation via a Dialog.
 */
export function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { portfolios, loading, create, duplicate, rename, remove } =
    usePortfolioStore();

  const [busy, setBusy] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Portfolio | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Move focus to the title field when the rename dialog opens (instead of the
  // autoFocus prop, which the a11y lint rule discourages for general use).
  useEffect(() => {
    if (renameTarget) {
      // The dialog mounts via a portal; focus after it is in the DOM.
      const id = window.setTimeout(() => renameInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [renameTarget]);

  const openEditor = (portfolio: Portfolio) => {
    navigate(`/editor/${portfolio.id}`);
  };

  const handleCreate = async () => {
    setBusy(true);
    try {
      const portfolio = await create();
      navigate(`/editor/${portfolio.id}`);
    } catch {
      toast.show({
        title: 'Gagal membuat portfolio',
        message: 'Coba lagi sebentar.',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDuplicate = async (portfolio: Portfolio) => {
    try {
      await duplicate(portfolio.id);
      toast.show({
        title: 'Portfolio diduplikasi',
        message: `Salinan dari "${portfolio.title}" dibuat sebagai draft.`,
        variant: 'success',
      });
    } catch {
      toast.show({ title: 'Gagal menduplikasi portfolio', variant: 'error' });
    }
  };

  const openRename = (portfolio: Portfolio) => {
    setRenameTarget(portfolio);
    setRenameValue(portfolio.title);
    setRenameError(undefined);
  };

  const submitRename = async (event: FormEvent) => {
    event.preventDefault();
    if (!renameTarget) return;
    const parsed = portfolioTitleSchema.safeParse(renameValue);
    if (!parsed.success) {
      setRenameError(parsed.error.issues[0]?.message ?? 'Judul tidak valid');
      return;
    }
    try {
      await rename(renameTarget.id, parsed.data);
      setRenameTarget(null);
      toast.show({ title: 'Judul diperbarui', variant: 'success' });
    } catch {
      setRenameError('Gagal menyimpan judul. Coba lagi.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const title = deleteTarget.title;
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      toast.show({
        title: 'Portfolio dihapus',
        message: `"${title}" dipindahkan ke tempat sampah.`,
        variant: 'success',
      });
    } catch {
      toast.show({ title: 'Gagal menghapus portfolio', variant: 'error' });
    }
  };

  return (
    <section aria-labelledby="dashboard-heading" className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 id="dashboard-heading" className={styles.title}>
            Portfolio kamu
          </h1>
          <p className={styles.subtitle}>
            Semua portfolio tersimpan di browser ini.
          </p>
        </div>
        {portfolios.length > 0 ? (
          <Button variant="primary" onClick={handleCreate} loading={busy}>
            Buat Portfolio Baru
          </Button>
        ) : null}
      </header>

      {loading ? (
        <ul className={styles.grid} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className={styles.skeletonCard}>
              <Skeleton height="7rem" />
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </li>
          ))}
        </ul>
      ) : portfolios.length === 0 ? (
        <EmptyState
          title="Belum ada portfolio"
          description="Mulai dari profil, pengalaman, atau satu project terbaikmu."
          action={
            <Button variant="primary" onClick={handleCreate} loading={busy}>
              Buat Portfolio Pertama
            </Button>
          }
        />
      ) : (
        <ul className={styles.grid}>
          {portfolios.map((portfolio) => (
            <PortfolioCard
              key={portfolio.id}
              portfolio={portfolio}
              onOpen={openEditor}
              onDuplicate={handleDuplicate}
              onRename={openRename}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      {/* Rename dialog */}
      <Dialog
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Ubah judul portfolio"
        footer={
          <>
            <Button onClick={() => setRenameTarget(null)}>Batal</Button>
            <Button variant="primary" type="submit" form="rename-form">
              Simpan
            </Button>
          </>
        }
      >
        <form id="rename-form" onSubmit={submitRename}>
          <Input
            ref={renameInputRef}
            label="Judul"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            error={renameError}
            required
          />
        </form>
      </Dialog>

      {/* Delete confirmation — destructive actions must be confirmed. */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Hapus portfolio?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" akan dipindahkan ke tempat sampah dan tidak lagi tampil di daftar.`
            : undefined
        }
        footer={
          <>
            <Button onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete}>
              Hapus
            </Button>
          </>
        }
      />
    </section>
  );
}

export default Dashboard;
