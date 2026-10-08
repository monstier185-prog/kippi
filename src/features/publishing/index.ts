/**
 * Public surface of the publishing feature (spec Sesi 7).
 *
 * `PublicPortfolioView` renders /p/:slug (published-only), `PrintCVView`
 * renders the /cv/:id print/PDF export surface, and `PublishDialog` is the
 * explicit publish/unpublish control with the honest local-first Privacy UX.
 * `publishModel` holds the single definition of "publicly viewable" shared by
 * the view, the editor, and the tests.
 */
export { PublicPortfolioView } from './PublicPortfolioView';
export { PrintCVView } from './PrintCVView';
export { PublishDialog } from './PublishDialog';
export type { PublishDialogProps } from './PublishDialog';
export {
  isPubliclyViewable,
  publishPatch,
  unpublishPatch,
  publicPath,
  publicUrl,
} from './publishModel';
export { printPortfolio } from './print';
