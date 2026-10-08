/**
 * Public portfolio view at /p/:slug (spec Sesi 7 §5.4).
 *
 * This view renders a portfolio with the shared `PortfolioRenderer` and ALL
 * editor chrome removed, as semantic HTML inside a single <main>. It is the
 * public face of a portfolio, so it must behave honestly:
 *
 *  - A portfolio is shown ONLY when it is explicitly `published`
 *    (`isPubliclyViewable`). A draft/private portfolio — even if its slug is
 *    known — renders a "not available" page, never its content. This is the
 *    authorization-equivalent rule for a local-first app (there is no server to
 *    enforce it, so the renderer enforces it).
 *  - Because there is no server, this page reads from THIS browser's storage.
 *    A short, honest banner states that; the app never implies live hosting.
 *  - Share/SEO metadata (title + description + robots) is derived from
 *    `seoConfig`, normalized to plain text. A non-published page is `noindex`.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../components/ErrorState';
import { useDocumentHead } from '../../lib/useDocumentHead';
import { toPlainText } from '../../lib/sanitize';
import type { Portfolio } from '../../models';
import { usePortfolioStore } from '../../services/usePortfolioStore';
import { PortfolioRenderer } from '../portfolio-preview/PortfolioRenderer';
import { findProfile } from '../portfolio-preview/sectionView';
import { isPubliclyViewable } from './publishModel';
import { printPortfolio } from './print';
import styles from './PublicPortfolioView.module.css';

type LoadState = 'loading' | 'ready' | 'not-found';

export function PublicPortfolioView() {
  const { slug } = useParams<{ slug: string }>();
  const { repository } = usePortfolioStore();
  const [state, setState] = useState<LoadState>('loading');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    let active = true;
    setState('loading');
    repository
      .list()
      .then((all) => {
        if (!active) return;
        const match = all.find((p) => p.slug === slug) ?? null;
        // Only a published portfolio is ever exposed through this route.
        if (match && isPubliclyViewable(match)) {
          setPortfolio(match);
          setState('ready');
        } else {
          setPortfolio(null);
          setState('not-found');
        }
      })
      .catch(() => {
        if (active) setState('not-found');
      });
    return () => {
      active = false;
    };
  }, [slug, repository]);

  const profile = portfolio ? findProfile(portfolio) : null;
  const metaTitle = useMemo(() => {
    if (!portfolio) return 'Portfolio tidak tersedia — MyStreet.id';
    const name = toPlainText(profile?.fullName);
    const base = toPlainText(portfolio.seoConfig.title) || name || portfolio.title;
    return `${base} — MyStreet.id`;
  }, [portfolio, profile]);

  const metaDescription = useMemo(() => {
    if (!portfolio) return undefined;
    return (
      toPlainText(portfolio.seoConfig.description) ||
      toPlainText(profile?.summary) ||
      toPlainText(profile?.headline) ||
      undefined
    );
  }, [portfolio, profile]);

  // Private/draft/not-found pages are never indexable; a published page honors
  // the author's explicit noindex choice.
  const noindex = !portfolio || Boolean(portfolio.seoConfig.noindex);
  useDocumentHead({ title: metaTitle, description: metaDescription, noindex });

  if (state === 'loading') {
    return (
      <div className={styles.center} role="status">
        <p>Memuat portfolio…</p>
      </div>
    );
  }

  if (state === 'not-found' || !portfolio) {
    return (
      <div className={styles.center}>
        <ErrorState
          title="Portfolio ini tidak tersedia"
          what="Tautan ini tidak menampilkan portfolio apa pun di browser ini. Mungkin portfolio-nya privat, belum dipublikasikan, sudah dinonaktifkan, atau dibuat di perangkat/browser lain. Karena MyStreet.id bersifat lokal, tautan publik hanya aktif di browser tempat portfolio dipublikasikan."
          dataSafe
          retryable={false}
          recoveryAction={
            <Link to="/dashboard" className={styles.homeLink}>
              Ke dashboard
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.localBanner} role="note">
        <span>
          Tampilan publik lokal. Halaman ini dibaca dari penyimpanan browser
          ini, bukan dari server — tautannya tidak dapat dibuka di perangkat
          lain.
        </span>
        <button
          type="button"
          className={styles.printBtn}
          onClick={() => printPortfolio()}
        >
          Download / Print CV
        </button>
      </div>
      <main id="public-main" className={styles.main}>
        <PortfolioRenderer portfolio={portfolio} mode="portfolio" />
      </main>
    </div>
  );
}

export default PublicPortfolioView;
