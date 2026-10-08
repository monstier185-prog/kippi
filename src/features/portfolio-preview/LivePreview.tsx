/**
 * LivePreview — the editor-side wrapper around the shared PortfolioRenderer.
 *
 * This is where editor-only chrome lives (device switch, CV/portfolio mode
 * switch, zoom, draft/published status). The renderer itself stays clean so the
 * public view can reuse it directly. Because the renderer updates in place as
 * the model changes, the scroll position of the preview viewport is preserved
 * across edits — React re-renders the same scroll container rather than
 * remounting it.
 */
import { useId, useState } from 'react';
import { IconButton } from '../../components/IconButton';
import { PreviewFrame } from '../../components/PreviewFrame';
import type { Portfolio, PublicationStatus } from '../../models';
import { PortfolioRenderer } from './PortfolioRenderer';
import type { PreviewMode } from './sectionView';
import styles from './LivePreview.module.css';

type Device = 'desktop' | 'tablet' | 'mobile';

const DEVICE_LABEL: Record<Device, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile',
};

const STATUS_LABEL: Record<PublicationStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  private: 'Private',
};

const ZOOM_STEPS = [0.6, 0.75, 0.9, 1, 1.15] as const;

export interface LivePreviewProps {
  portfolio: Portfolio;
  status: PublicationStatus;
}

export function LivePreview({ portfolio, status }: LivePreviewProps) {
  const [device, setDevice] = useState<Device>('desktop');
  const [mode, setMode] = useState<PreviewMode>('portfolio');
  const [zoomIndex, setZoomIndex] = useState(3); // 1.0
  const groupId = useId();

  const zoom = ZOOM_STEPS[zoomIndex];
  const canZoomOut = zoomIndex > 0;
  const canZoomIn = zoomIndex < ZOOM_STEPS.length - 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        {/* Device switch */}
        <div
          className={styles.segment}
          role="group"
          aria-label="Ukuran layar pratinjau"
        >
          {(Object.keys(DEVICE_LABEL) as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`${styles.segBtn} ${device === d ? styles.segActive : ''}`}
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
            >
              {DEVICE_LABEL[d]}
            </button>
          ))}
        </div>

        {/* CV vs portfolio mode switch */}
        <div
          className={styles.segment}
          role="group"
          aria-label="Mode tampilan"
        >
          <button
            type="button"
            className={`${styles.segBtn} ${mode === 'portfolio' ? styles.segActive : ''}`}
            aria-pressed={mode === 'portfolio'}
            onClick={() => setMode('portfolio')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`${styles.segBtn} ${mode === 'cv' ? styles.segActive : ''}`}
            aria-pressed={mode === 'cv'}
            onClick={() => setMode('cv')}
          >
            CV
          </button>
        </div>

        {/* Zoom */}
        <div className={styles.zoom} role="group" aria-label="Perbesar pratinjau">
          <IconButton
            aria-label="Perkecil pratinjau"
            size="sm"
            disabled={!canZoomOut}
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
          >
            −
          </IconButton>
          <span className={styles.zoomValue} aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <IconButton
            aria-label="Perbesar pratinjau"
            size="sm"
            disabled={!canZoomIn}
            onClick={() =>
              setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
            }
          >
            +
          </IconButton>
        </div>

        {/* Draft / published status */}
        <span
          className={`${styles.status} ${styles[`status_${status}`]}`}
          data-status={status}
        >
          <span className={styles.statusDot} aria-hidden="true" />
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className={styles.scroll} id={`${groupId}-scroll`}>
        <div
          className={styles.zoomLayer}
          style={{ ['--pf-zoom' as string]: String(zoom) }}
        >
          <PreviewFrame
            device={device}
            address={`mystreet.id/p/${portfolio.slug}`}
            label="Pratinjau langsung portfolio"
          >
            <PortfolioRenderer portfolio={portfolio} mode={mode} />
          </PreviewFrame>
        </div>
      </div>
    </div>
  );
}

export default LivePreview;
