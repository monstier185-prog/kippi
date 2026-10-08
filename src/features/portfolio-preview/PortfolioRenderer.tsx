/**
 * PortfolioRenderer — the single, reusable renderer that turns the typed
 * Portfolio model into a rendered page.
 *
 * This component is deliberately free of ANY editor-only chrome or state
 * (no device frame, no zoom, no save status). It consumes exactly the shared
 * model, so the identical renderer powers both the in-editor live preview and
 * the public /p/:slug view (FEAT-006). Switching template or theme only changes
 * structure/presentation here — never the underlying data.
 *
 * Anti-slop: when the model has no visible, non-empty content, the renderer
 * shows an honest "nothing yet" note instead of fabricated placeholder content.
 */
import { useMemo } from 'react';
import type { Portfolio } from '../../models';
import { isPortfolioEmpty, type PreviewMode } from './sectionView';
import { resolveTheme, themeStyle } from './theme';
import { EditorialTemplate } from './templates/EditorialTemplate';
import { StructuredTemplate } from './templates/StructuredTemplate';
import { QuietStudioTemplate } from './templates/QuietStudioTemplate';
import type { TemplateProps } from './templates/templateTypes';
import styles from './PortfolioRenderer.module.css';

export interface PortfolioRendererProps {
  portfolio: Portfolio;
  /** CV (condensed) vs full portfolio. Defaults to portfolio. */
  mode?: PreviewMode;
  className?: string;
}

const TEMPLATES: Record<string, (props: TemplateProps) => JSX.Element> = {
  editorial: EditorialTemplate,
  structured: StructuredTemplate,
  quietStudio: QuietStudioTemplate,
};

export function PortfolioRenderer({
  portfolio,
  mode = 'portfolio',
  className,
}: PortfolioRendererProps) {
  const theme = useMemo(
    () => resolveTheme(portfolio.themeConfig, portfolio.templateId),
    [portfolio.themeConfig, portfolio.templateId],
  );
  const style = useMemo(() => themeStyle(theme), [theme]);
  const empty = isPortfolioEmpty(portfolio, mode);

  const Template = TEMPLATES[theme.templateId] ?? EditorialTemplate;

  return (
    <div
      className={[styles.surface, className].filter(Boolean).join(' ')}
      style={style}
      data-mode={mode}
      data-template={theme.templateId}
    >
      {empty ? (
        <p className={styles.empty}>
          Belum ada isi untuk ditampilkan. Tambahkan profil atau satu bagian
          untuk melihat portfolio-mu di sini.
        </p>
      ) : (
        <Template portfolio={portfolio} mode={mode} theme={theme} />
      )}
    </div>
  );
}

export default PortfolioRenderer;
