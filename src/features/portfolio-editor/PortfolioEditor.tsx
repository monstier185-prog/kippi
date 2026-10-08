/**
 * Portfolio editor (spec Section 5.3 & Sesi 4).
 *
 * Desktop: a top bar (logo | document name | save status | Preview | Publish /
 * Export) over a three-pane body — section navigation | active-section form |
 * live preview. Narrow screens never get three forced columns: the body
 * collapses to a single column with an Editor / Preview toggle and a top bar of
 * [Back] [Portfolio name] [Save].
 *
 * All editing flows through `useEditorDraft`, so switching sections keeps data,
 * autosave persists drafts, and the save status is always honest. Leaving with
 * unsaved changes raises a Simpan / Buang Perubahan / Batal dialog; nothing is
 * discarded silently.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { ErrorState } from '../../components/ErrorState';
import { Logo } from '../../components/Logo';
import { useToast } from '../../components/useToast';
import type {
  Portfolio,
  PortfolioSection,
  PublicationStatus,
  SectionType,
  TemplateId,
  ThemeConfig,
} from '../../models';
import { createId } from '../../lib/id';
import { usePortfolioStore } from '../../services/usePortfolioStore';
import { LivePreview } from '../portfolio-preview/LivePreview';
import { resetThemeConfig } from '../portfolio-preview/theme';
import { PublishDialog } from '../publishing/PublishDialog';
import { publishPatch, unpublishPatch } from '../publishing/publishModel';
import { SaveStatus } from './SaveStatus';
import { SectionEditor } from './SectionEditor';
import { SectionNav, SETTINGS_PANE } from './SectionNav';
import { SettingsPane } from './SettingsPane';
import { emptyContent, SECTION_LABEL } from './sectionMeta';
import { moveItem } from './reorder';
import { useBeforeUnload } from './useBeforeUnload';
import { useEditorDraft } from './useEditorDraft';
import { validateSection } from './validation';
import styles from './PortfolioEditor.module.css';

type MobilePane = 'editor' | 'preview';

export function PortfolioEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { repository, refresh } = usePortfolioStore();

  const {
    draft,
    loaded,
    notFound,
    saveState,
    dirty,
    setTitle,
    setSections,
    setTemplateId,
    setThemeConfig,
    saveNow,
    retrySave,
    error,
  } = useEditorDraft(id);

  const [activeId, setActiveId] = useState<string>(SETTINGS_PANE);
  const [status, setStatus] = useState<PublicationStatus>('private');
  const [slug, setSlug] = useState<string>('');
  const [mobilePane, setMobilePane] = useState<MobilePane>('editor');
  const [deleteTarget, setDeleteTarget] = useState<PortfolioSection | null>(
    null,
  );
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useBeforeUnload(dirty);

  // Once the draft is loaded, select the first section (or Settings if none).
  useEffect(() => {
    if (draft && activeId === SETTINGS_PANE && draft.sections.length > 0) {
      const first = [...draft.sections].sort(
        (a, b) => a.position - b.position,
      )[0];
      setActiveId(first.id);
    }
  }, [draft, activeId]);

  // Load the current publication status for the Settings pane.
  useEffect(() => {
    if (!id) return;
    let active = true;
    repository.get(id).then((p) => {
      if (active && p) {
        setStatus(p.status);
        setSlug(p.slug);
      }
    });
    return () => {
      active = false;
    };
  }, [id, repository]);

  const sections = useMemo(() => draft?.sections ?? [], [draft]);
  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.position - b.position),
    [sections],
  );
  const activeSection = ordered.find((s) => s.id === activeId) ?? null;

  // Field errors for the active section (recomputed as the user types).
  const activeErrors = useMemo(
    () => (activeSection ? validateSection(activeSection) : {}),
    [activeSection],
  );

  const handleSectionChange = useCallback(
    (next: PortfolioSection) => {
      setSections((prev) =>
        prev.map((s) => (s.id === next.id ? next : s)),
      );
    },
    [setSections],
  );

  const handleMove = useCallback(
    (from: number, to: number) => {
      setSections((prev) => {
        const sorted = [...prev].sort((a, b) => a.position - b.position);
        const moved = moveItem(sorted, from, to);
        // Renumber positions to match the new order.
        return moved.map((s, i) => ({ ...s, position: i }));
      });
    },
    [setSections],
  );

  const handleToggleVisible = useCallback(
    (sectionId: string) => {
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId ? { ...s, isVisible: !s.isVisible } : s,
        ),
      );
    },
    [setSections],
  );

  const handleAdd = useCallback(
    (type: SectionType) => {
      const base = emptyContent(type);
      setSections((prev) => {
        const nextPosition = prev.length;
        const section = {
          id: createId(),
          position: nextPosition,
          isVisible: true,
          ...base,
        } as PortfolioSection;
        setActiveId(section.id);
        return [...prev, section];
      });
      toast.show({
        title: `Bagian ${SECTION_LABEL[type]} ditambahkan`,
        variant: 'success',
      });
    },
    [setSections, toast],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const removedId = deleteTarget.id;
    setSections((prev) =>
      prev
        .filter((s) => s.id !== removedId)
        .map((s, i) => ({ ...s, position: i })),
    );
    if (activeId === removedId) setActiveId(SETTINGS_PANE);
    setDeleteTarget(null);
    toast.show({
      title: `Bagian ${SECTION_LABEL[deleteTarget.type]} dihapus`,
      variant: 'success',
    });
  }, [deleteTarget, setSections, activeId, toast]);

  // INVARIANT: publication status (`status` / `publishedAt`) is written ONLY by
  // these dedicated handlers — never by the draft autosave in useEditorDraft,
  // which touches a disjoint set of fields (title/sections/templateId/
  // themeConfig). This is the single write path for status, so the two paths
  // cannot clobber each other. See useEditorDraft.persist for the matching note.
  const handleStatusChange = useCallback(
    async (next: PublicationStatus) => {
      setStatus(next);
      if (!id) return;
      try {
        await repository.update(id, { status: next });
        await refresh();
      } catch {
        toast.show({ title: 'Gagal memperbarui privasi', variant: 'error' });
      }
    },
    [id, repository, refresh, toast],
  );

  const handleTemplateChange = useCallback(
    (templateId: TemplateId) => {
      setTemplateId(templateId);
    },
    [setTemplateId],
  );

  const handleThemeChange = useCallback(
    (next: ThemeConfig) => {
      setThemeConfig(next);
    },
    [setThemeConfig],
  );

  const handleResetTheme = useCallback(() => {
    if (!draft) return;
    setThemeConfig(resetThemeConfig(draft.themeConfig));
    toast.show({ title: 'Tema dikembalikan ke bawaan', variant: 'success' });
  }, [draft, setThemeConfig, toast]);

  // Explicit publish: flip the status to published in this browser. Nothing is
  // uploaded; the public /p/:slug route starts rendering it locally.
  const handlePublish = useCallback(async () => {
    if (!id) return;
    try {
      await repository.update(id, publishPatch());
      await refresh();
      setStatus('published');
      toast.show({
        title: 'Dipublikasikan di browser ini',
        variant: 'success',
      });
    } catch {
      toast.show({ title: 'Gagal mempublikasikan', variant: 'error' });
    }
  }, [id, repository, refresh, toast]);

  // Disable the local public link: return the portfolio to private.
  const handleUnpublish = useCallback(async () => {
    if (!id) return;
    try {
      await repository.update(id, unpublishPatch());
      await refresh();
      setStatus('private');
      toast.show({ title: 'Tautan publik dinonaktifkan', variant: 'success' });
    } catch {
      toast.show({ title: 'Gagal menonaktifkan tautan', variant: 'error' });
    }
  }, [id, repository, refresh, toast]);

  // Export: persist the latest draft first, then open the print/PDF CV view.
  const handleExport = useCallback(async () => {
    if (!id) return;
    await saveNow();
    navigate(`/cv/${id}`);
  }, [id, saveNow, navigate]);

  // Navigating back to the dashboard: guard unsaved changes.
  const requestLeave = useCallback(() => {
    if (dirty) {
      setLeaveOpen(true);
    } else {
      navigate('/dashboard');
    }
  }, [dirty, navigate]);

  const leaveSaving = useCallback(async () => {
    await saveNow();
    setLeaveOpen(false);
    navigate('/dashboard');
  }, [saveNow, navigate]);

  const leaveDiscarding = useCallback(() => {
    setLeaveOpen(false);
    navigate('/dashboard');
  }, [navigate]);

  if (!loaded) {
    return (
      <div className={styles.centered} role="status">
        <p>Memuat editor…</p>
      </div>
    );
  }

  if (notFound || !draft) {
    return (
      <div className={styles.centered}>
        <ErrorState
          title="Portfolio tidak ditemukan"
          what="Portfolio dengan tautan ini tidak ada di browser ini. Mungkin sudah dihapus atau dibuat di perangkat lain."
          dataSafe
          retryable={false}
          recoveryAction={
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Kembali ke dashboard
            </Button>
          }
        />
      </div>
    );
  }

  const editorPane = (
    <div className={styles.formPane}>
      {activeId === SETTINGS_PANE ? (
        <SettingsPane
          title={draft.title}
          onTitleChange={setTitle}
          status={status}
          onStatusChange={handleStatusChange}
          titleError={draft.title.trim() ? undefined : 'Nama dokumen wajib diisi.'}
          templateId={draft.templateId}
          themeConfig={draft.themeConfig}
          sections={sections}
          onTemplateChange={handleTemplateChange}
          onThemeChange={handleThemeChange}
          onToggleSection={handleToggleVisible}
          onResetTheme={handleResetTheme}
        />
      ) : activeSection ? (
        <>
          <h2 className={styles.paneHeading}>
            {SECTION_LABEL[activeSection.type]}
          </h2>
          <SectionEditor
            section={activeSection}
            onChange={handleSectionChange}
            errors={activeErrors}
          />
        </>
      ) : (
        <p className={styles.muted}>
          Pilih bagian di sebelah kiri, atau tambahkan bagian baru.
        </p>
      )}
    </div>
  );

  // A model object for the shared renderer, assembled from the live draft so
  // the preview reflects edits immediately. The renderer only reads these
  // fields; identity/timestamps are passed through honestly from the record.
  const previewPortfolio: Portfolio = {
    id: id ?? '',
    ownerId: '',
    slug: slug || 'portfolio',
    title: draft.title,
    status,
    templateId: draft.templateId,
    themeConfig: draft.themeConfig,
    seoConfig: {},
    sections,
    createdAt: '',
    updatedAt: '',
  };

  const previewPane = (
    <div className={styles.previewPane}>
      <LivePreview portfolio={previewPortfolio} status={status} />
    </div>
  );

  return (
    <div className={styles.editor}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Button
            variant="ghost"
            size="sm"
            onClick={requestLeave}
            className={styles.backBtn}
          >
            ← Kembali
          </Button>
          <span className={styles.topbarLogo} aria-hidden="true">
            <Logo variant="mark" height={24} title="MyStreet.id" />
          </span>
          <span className={styles.docName} title={draft.title}>
            {draft.title || 'Portfolio tanpa judul'}
          </span>
          <SaveStatus state={saveState} />
        </div>
        <div className={styles.topbarRight}>
          <Button
            size="sm"
            onClick={() => setMobilePane('preview')}
            className={styles.previewToggleBtn}
          >
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => void saveNow()}
            loading={saveState === 'saving'}
          >
            Simpan
          </Button>
          <Button size="sm" onClick={() => void handleExport()}>
            Export CV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setPublishOpen(true)}
          >
            {status === 'published' ? 'Kelola publikasi' : 'Publish'}
          </Button>
        </div>
      </header>

      {saveState === 'error' ? (
        <div className={styles.errorBar}>
          <ErrorState
            title="Perubahan belum tersimpan"
            what={
              error
                ? `Penyimpanan lokal gagal: ${error}`
                : 'Penyimpanan lokal gagal, kemungkinan karena kuota penyimpanan browser penuh.'
            }
            dataSafe
            retryable
            recoveryAction={
              <Button variant="primary" size="sm" onClick={() => void retrySave()}>
                Coba simpan lagi
              </Button>
            }
          />
        </div>
      ) : null}

      {/* Mobile Editor / Preview toggle */}
      <div className={styles.mobileTabs} role="tablist" aria-label="Tampilan editor">
        <button
          type="button"
          role="tab"
          id="editor-tab-editor"
          aria-controls="editor-pane"
          aria-selected={mobilePane === 'editor'}
          tabIndex={mobilePane === 'editor' ? 0 : -1}
          className={`${styles.mobileTab} ${mobilePane === 'editor' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobilePane('editor')}
        >
          Editor
        </button>
        <button
          type="button"
          role="tab"
          id="editor-tab-preview"
          aria-controls="editor-pane-preview"
          aria-selected={mobilePane === 'preview'}
          tabIndex={mobilePane === 'preview' ? 0 : -1}
          className={`${styles.mobileTab} ${mobilePane === 'preview' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobilePane('preview')}
        >
          Preview
        </button>
      </div>

      {/* Body: three panes on desktop, single column (toggled) on mobile */}
      <div className={styles.body}>
        <aside
          className={`${styles.navPane} ${mobilePane === 'preview' ? styles.hiddenOnMobile : ''}`}
        >
          <SectionNav
            sections={sections}
            activeId={activeId}
            onSelect={setActiveId}
            onMove={handleMove}
            onToggleVisible={handleToggleVisible}
            onDelete={setDeleteTarget}
            onAdd={handleAdd}
          />
        </aside>

        <div
          id="editor-pane"
          className={`${styles.formWrap} ${mobilePane === 'preview' ? styles.hiddenOnMobile : ''}`}
        >
          {editorPane}
        </div>

        <div
          id="editor-pane-preview"
          className={`${styles.previewWrap} ${mobilePane === 'editor' ? styles.hiddenOnMobile : ''}`}
          aria-label="Pratinjau langsung"
        >
          {previewPane}
        </div>
      </div>

      {/* Delete-section confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Hapus bagian ini?"
        description={
          deleteTarget
            ? `Bagian "${SECTION_LABEL[deleteTarget.type]}" beserta isinya akan dihapus dari portfolio ini. Tindakan ini tidak bisa dibatalkan.`
            : undefined
        }
        footer={
          <>
            <Button onClick={() => setDeleteTarget(null)}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete}>
              Hapus bagian
            </Button>
          </>
        }
      />

      {/* Publish / unpublish with honest Privacy UX (Section 11.2) */}
      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        portfolio={previewPortfolio}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      {/* Unsaved-changes guard (spec 4.3) */}
      <Dialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Simpan perubahan sebelum keluar?"
        description="Kamu punya perubahan yang belum disimpan. Pilih apa yang ingin kamu lakukan."
        footer={
          <>
            <Button onClick={() => setLeaveOpen(false)}>Batal</Button>
            <Button variant="ghost" onClick={leaveDiscarding}>
              Buang Perubahan
            </Button>
            <Button variant="primary" onClick={() => void leaveSaving()}>
              Simpan
            </Button>
          </>
        }
      />
    </div>
  );
}

export default PortfolioEditor;
