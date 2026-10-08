import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LandingPage from '../../features/landing/LandingPage';

/**
 * Landing route. The production landing experience lives in the `landing`
 * feature. This wrapper also handles in-page anchor scrolling (e.g. the header
 * "Cara kerja" / "Contoh" links navigate to `/#cara-kerja` and `/#contoh`),
 * honoring reduced-motion via native scrollIntoView defaults.
 */
export default function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ block: 'start' });
    }
  }, [hash]);

  return <LandingPage />;
}
