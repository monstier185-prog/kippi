/**
 * The single model-to-view contract every template implements. All three
 * templates receive exactly this — the typed Portfolio and the render mode —
 * so switching template can never lose or reshape data.
 */
import type { Portfolio } from '../../../models';
import type { PreviewMode } from '../sectionView';
import type { ResolvedTheme } from '../theme';

export interface TemplateProps {
  portfolio: Portfolio;
  mode: PreviewMode;
  theme: ResolvedTheme;
}
