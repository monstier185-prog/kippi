/**
 * Public surface of the portfolio-preview feature.
 *
 * `PortfolioRenderer` is the reusable, editor-free renderer (also consumed by
 * the public /p/:slug view in FEAT-006). `LivePreview` wraps it with the
 * editor-only controls (device/mode/zoom/status). The theme module exports the
 * constrained option sets, defaults, and reset helper used by the Settings UI.
 */
export { PortfolioRenderer } from './PortfolioRenderer';
export type { PortfolioRendererProps } from './PortfolioRenderer';

export { LivePreview } from './LivePreview';
export type { LivePreviewProps } from './LivePreview';

export { ThemeControls } from './ThemeControls';
export type { ThemeControlsProps } from './ThemeControls';

export type { PreviewMode } from './sectionView';

export {
  ACCENTS,
  TYPOGRAPHY_PAIRINGS,
  SPACING_DENSITIES,
  PROFILE_IMAGE_SHAPES,
  TEMPLATES,
  DEFAULT_THEME,
  DEFAULT_TEMPLATE_ID,
  resolveTheme,
  resetThemeConfig,
} from './theme';
export type { ResolvedTheme } from './theme';
