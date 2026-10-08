/**
 * Draft state + autosave for the editor.
 *
 * The whole portfolio (title + all sections) lives in one in-memory `draft`
 * object, so switching between sections only changes which part of that object
 * is shown — nothing is lost on switch. Edits mark the draft `unsaved`; a
 * debounced effect persists it through the repository (via the store `update`)
 * and reflects the `SaveState` back to the UI. On reload the editor re-reads
 * the portfolio from the repository, so the last persisted draft is restored.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  Portfolio,
  PortfolioSection,
  SaveState,
  ThemeConfig,
} from '../../models';
import { usePortfolioStore } from '../../services/usePortfolioStore';

export interface EditorDraft {
  title: string;
  sections: PortfolioSection[];
  templateId: string;
  themeConfig: ThemeConfig;
}

export interface UseEditorDraftResult {
  draft: EditorDraft | null;
  /** True once the portfolio has been loaded (or confirmed missing). */
  loaded: boolean;
  /** True when the requested id does not resolve to a portfolio. */
  notFound: boolean;
  saveState: SaveState;
  /** True when there are edits not yet persisted. */
  dirty: boolean;
  setTitle: (title: string) => void;
  setSections: (
    updater: (sections: PortfolioSection[]) => PortfolioSection[],
  ) => void;
  setTemplateId: (templateId: string) => void;
  setThemeConfig: (themeConfig: ThemeConfig) => void;
  /** Persist immediately (used by the explicit Save button / unsaved guard). */
  saveNow: () => Promise<void>;
  /** Re-attempt a persist after a failure. */
  retrySave: () => Promise<void>;
  /** The last persist error message, if any. */
  error: string | null;
}

const AUTOSAVE_DELAY = 800;

export function useEditorDraft(id: string | undefined): UseEditorDraftResult {
  const { repository } = usePortfolioStore();

  const [draft, setDraft] = useState<EditorDraft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftRef = useRef<EditorDraft | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  // Keep a ref of the latest draft for the debounced save without re-binding.
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Initial load (and reload) of the portfolio by id.
  useEffect(() => {
    let active = true;
    setLoaded(false);
    setNotFound(false);
    if (!id) {
      setNotFound(true);
      setLoaded(true);
      return;
    }
    repository
      .get(id)
      .then((portfolio) => {
        if (!active) return;
        if (!portfolio) {
          setNotFound(true);
        } else {
          setDraft({
            title: portfolio.title,
            sections: portfolio.sections,
            templateId: portfolio.templateId,
            themeConfig: portfolio.themeConfig,
          });
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [id, repository]);

  const persist = useCallback(async () => {
    const current = draftRef.current;
    if (!id || !current || savingRef.current) return;
    savingRef.current = true;
    setSaveState('saving');
    try {
      // INVARIANT: the draft autosave writes ONLY content/presentation fields
      // (title/sections/templateId/themeConfig). It must NEVER write `status`
      // or `publishedAt` — publication status is a separate concern, written
      // exclusively via the dedicated editor handlers (handleStatusChange /
      // handlePublish / handleUnpublish → publishModel patches). Keeping these
      // field sets disjoint is what prevents an autosave from clobbering a
      // publish (and vice versa). If `status` is ever added to the draft, these
      // two write paths must be consolidated onto one.
      await repository.update(id, {
        title: current.title,
        sections: current.sections,
        templateId: current.templateId,
        themeConfig: current.themeConfig,
      } as Partial<Portfolio>);
      // Only clear dirty if nothing changed again while the save was running.
      if (draftRef.current === current) {
        setDirty(false);
        setSaveState('saved');
      } else {
        setSaveState('unsaved');
      }
      setError(null);
    } catch (err) {
      setSaveState('error');
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    } finally {
      savingRef.current = false;
    }
  }, [id, repository]);

  // Debounced autosave: whenever the draft changes and is dirty, schedule a
  // persist. Clearing the timer on each change collapses rapid edits into one.
  useEffect(() => {
    if (!dirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void persist();
    }, AUTOSAVE_DELAY);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [draft, dirty, persist]);

  const markDirty = useCallback(() => {
    setDirty(true);
    setSaveState('unsaved');
  }, []);

  const setTitle = useCallback(
    (title: string) => {
      setDraft((prev) => (prev ? { ...prev, title } : prev));
      markDirty();
    },
    [markDirty],
  );

  const setSections = useCallback(
    (updater: (sections: PortfolioSection[]) => PortfolioSection[]) => {
      setDraft((prev) =>
        prev ? { ...prev, sections: updater(prev.sections) } : prev,
      );
      markDirty();
    },
    [markDirty],
  );

  const setTemplateId = useCallback(
    (templateId: string) => {
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              templateId,
              themeConfig: { ...prev.themeConfig, templateId },
            }
          : prev,
      );
      markDirty();
    },
    [markDirty],
  );

  const setThemeConfig = useCallback(
    (themeConfig: ThemeConfig) => {
      setDraft((prev) => (prev ? { ...prev, themeConfig } : prev));
      markDirty();
    },
    [markDirty],
  );

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await persist();
  }, [persist]);

  const retrySave = useCallback(async () => {
    await persist();
  }, [persist]);

  return {
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
  };
}

export default useEditorDraft;
