import type { Portfolio } from '../../models';
import styles from './PortfolioThumbnail.module.css';

export interface PortfolioThumbnailProps {
  portfolio: Portfolio;
}

/**
 * A small, honest preview of a portfolio. It renders the portfolio's real title
 * and a line per visible section (by type) — never fabricated content, images,
 * or metrics. An empty portfolio shows a plain "belum ada bagian" placeholder.
 */
export function PortfolioThumbnail({ portfolio }: PortfolioThumbnailProps) {
  const visible = portfolio.sections
    .filter((section) => section.isVisible)
    .sort((a, b) => a.position - b.position)
    .slice(0, 4);

  return (
    <div className={styles.thumb} aria-hidden="true">
      <div className={styles.thumbTitle}>{portfolio.title}</div>
      {visible.length > 0 ? (
        <ul className={styles.thumbLines}>
          {visible.map((section) => (
            <li key={section.id} className={styles.thumbLine}>
              {SECTION_PREVIEW_LABEL[section.type]}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.thumbEmpty}>Belum ada bagian</p>
      )}
    </div>
  );
}

const SECTION_PREVIEW_LABEL: Record<Portfolio['sections'][number]['type'], string> =
  {
    profile: 'Profil',
    about: 'Tentang',
    experience: 'Pengalaman',
    education: 'Pendidikan',
    skills: 'Keahlian',
    projects: 'Karya',
    services: 'Layanan',
    certifications: 'Sertifikasi',
    awards: 'Penghargaan',
    testimonials: 'Testimoni',
    contact: 'Kontak',
    socialLinks: 'Tautan sosial',
  };

export default PortfolioThumbnail;
