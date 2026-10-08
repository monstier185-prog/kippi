/**
 * Print-ready CV view at /cv/:id (spec Sesi 7 export).
 *
 * This is a clean, single-column CV built from the shared renderer in `cv`
 * mode. It is addressed by portfolio id (the owner's own data in this browser),
 * so you can export a CV whether the portfolio is private, draft, or published
 * — exporting your own document never requires publishing it.
 *
 * The on-screen page shows a small toolbar (a "Print / Save as PDF" button and
 * a back link); the print stylesheet (`PrintCV.module.css` + the global
 * `@media print` rules) hides that chrome, applies A4-ish margins, controlled
 * page breaks, working links (URLs printed after link text), and keeps images
 * from overflowing. PDF export itself is the browser's "Save as PDF" — there is
 * no server-side PDF generation (documented honestly in the README).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../components/ErrorState';
import { Button } from '../../components/Button';
import { useDocumentHead } from '../../lib/useDocumentHead';
import { toPlainText } from '../../lib/sanitize';
import type { Portfolio } from '../../models';
import { usePortfolioStore } from '../../services/usePortfolioStore';
import { PortfolioRenderer } from '../portfolio-preview/PortfolioRenderer';
import { findProfile } from '../portfolio-preview/sectionView';
import { printPortfolio } from './print';
import styles from './PrintCV.module.css';

type LoadState = 'loading' | 'ready' | 'not-found';

export function PrintCVView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { repository } = usePortfolioStore();
  const [state, setState] = useState<LoadState>('loading');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    let active = true;
    setState('loading');
    if (!id) {
      setState('not-found');
      return;
    }
    repository
      .get(id)
      .then((p) => {
        if (!active) return;
        if (p) {
          setPortfolio(p);
          setState('ready');
        } else {
          setState('not-found');
        }
      })
      .catch(() => {
        if (active) setState('not-found');
      });
    return () => {
      active = false;
    };
  }, [id, repository]);

  const profile = portfolio ? findProfile(portfolio) : null;
  const title = useMemo(() => {
    if (!portfolio) return 'CV — MyStreet.id';
    const name = toPlainText(profile?.fullName) || portfolio.title;
    return `CV ${name} — MyStreet.id`;
  }, [portfolio, profile]);

  // A CV/export surface should never be indexed as a web page.
  useDocumentHead({ title, noindex: true });

  if (state === 'loading') {
    return (
      <div className={styles.center} role="status">
        <p>Menyiapkan CV…</p>
      </div>
    );
  }

  if (state === 'not-found' || !portfolio) {
    return (
      <div className={styles.center}>
        <ErrorState
          title="CV tidak ditemukan"
          what="Portfolio untuk CV ini tidak ada di browser ini."
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

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} data-print-hidden="true">
        <Link to={`/editor/${portfolio.id}`} className={styles.back}>
          ← Kembali ke editor
        </Link>
        <div className={styles.toolbarActions}>
          <span className={styles.hint}>
            Gunakan “Save as PDF” pada dialog cetak untuk menyimpan sebagai PDF.
          </span>
          <Button variant="primary" onClick={() => printPortfolio()}>
            Print / Save as PDF
          </Button>
        </div>
      </div>
      <div className={styles.sheet}>
        <PortfolioRenderer portfolio={portfolio} mode="cv" />
      </div>
    </div>
  );
}

export default PrintCVView;
