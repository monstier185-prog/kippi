import { Link, Route, Routes } from 'react-router-dom';
import Logo from '../components/Logo';
import { ToastProvider } from '../components/ToastProvider';
import { PortfolioStoreProvider } from '../services/PortfolioStoreProvider';
import Landing from './routes/Landing';
import Dashboard from '../features/dashboard';
import Editor from '../features/portfolio-editor';
import { PublicPortfolioView, PrintCVView } from '../features/publishing';
import NotFound from './routes/NotFound';
import './app.css';

/**
 * Application shell: a persistent header with brand + primary navigation, the
 * routed page outlet, and a quiet footer. Wrapped in ToastProvider so any
 * screen can raise a notification. No fabricated data lives here.
 */
export default function App() {
  return (
    <ToastProvider>
      <PortfolioStoreProvider>
        <div className="app-shell">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="app-header">
          <Link to="/" className="app-brand" aria-label="MyStreet.id beranda">
            <Logo variant="horizontal" height={28} title="MyStreet.id" />
          </Link>
          <nav aria-label="Utama">
            <ul className="app-nav">
              <li>
                <Link to="/#cara-kerja">Cara kerja</Link>
              </li>
              <li>
                <Link to="/#contoh">Contoh</Link>
              </li>
              <li>
                <Link to="/dashboard">Masuk</Link>
              </li>
              <li>
                <Link to="/dashboard" className="app-nav-cta">
                  Buat Portfolio
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main id="main" className="app-main">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/cv/:id" element={<PrintCVView />} />
            <Route path="/p/:slug" element={<PublicPortfolioView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <nav aria-label="Footer" className="app-footer-nav">
            <ul>
              <li>
                <Link to="/dashboard">Product</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
              <li>
                <Link to="/terms">Terms</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
          <p className="app-footer-note">
            MyStreet.id — local-first. Draft-mu tersimpan di browser ini; tidak
            ada yang diunggah ke server.
          </p>
        </footer>
        </div>
      </PortfolioStoreProvider>
    </ToastProvider>
  );
}
