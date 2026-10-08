import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { SectionCard } from '../../components/SectionCard';
import { PreviewFrame } from '../../components/PreviewFrame';
import { PortfolioSample } from './PortfolioSample';
import styles from './LandingPage.module.css';

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Isi informasi',
    description:
      'Masukkan profil, pengalaman, dan karya. Hanya isi bagian yang kamu butuhkan.',
  },
  {
    number: '02',
    title: 'Rapikan tampilan',
    description:
      'Pilih tata letak, atur urutan bagian, dan lihat perubahan langsung di preview.',
  },
  {
    number: '03',
    title: 'Bagikan hasilnya',
    description:
      'Ekspor halaman atau simpan sebagai berkas untuk dibagikan. Datamu tetap di browser ini.',
  },
];

/**
 * Production landing page (spec Section 5.1). Copy is concrete and specific;
 * there are no fabricated statistics, testimonials, logos, or badges. Coral is
 * reserved for the single primary CTA. The portfolio preview is built from real
 * components and clearly-labelled sample content, not a screenshot or fake data.
 */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* --- Hero --- */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroCopy}>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Buat portfolio yang terlihat seperti dirimu.
          </h1>
          <p className={styles.heroLede}>
            Susun CV, pengalaman, dan karya dalam satu halaman yang rapi.
          </p>
          <div className={styles.heroActions}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Buat Portfolio
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                document
                  .getElementById('contoh')
                  ?.scrollIntoView({ block: 'start' });
              }}
            >
              Lihat Contoh
            </Button>
          </div>
          <p className={styles.heroNote}>
            Berjalan di browser-mu. Draft tersimpan secara lokal, tidak diunggah
            ke server.
          </p>
        </div>

        <PreviewFrame address="mystreet.id/p/contoh" label="Contoh portfolio">
          <PortfolioSample layout="editorial" />
        </PreviewFrame>
      </section>

      {/* --- How it works --- */}
      <section className={styles.section} aria-labelledby="cara-kerja-heading">
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Cara kerja</span>
          <h2 id="cara-kerja-heading">Tiga langkah, tanpa basa-basi</h2>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.stepNumber}>{step.number}</span>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepDesc}>{step.description}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* --- Example layouts --- */}
      <section
        className={styles.section}
        id="contoh"
        aria-labelledby="contoh-heading"
      >
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Contoh</span>
          <h2 id="contoh-heading">Beberapa tata letak nyata</h2>
          <p>
            Tata letak di bawah ini memakai konten contoh untuk menunjukkan
            bentuk halaman jadi. Kamu bisa mulai dari salah satunya lalu
            menyesuaikannya.
          </p>
        </div>
        <div className={styles.examples}>
          <SectionCard>
            <div className={styles.exampleHead}>
              <span className={styles.exampleName}>Editorial</span>
              <span className={styles.exampleKind}>Satu kolom · naratif</span>
            </div>
            <PreviewFrame address="mystreet.id/p/editorial" label="Tata letak Editorial">
              <PortfolioSample layout="editorial" />
            </PreviewFrame>
          </SectionCard>
          <SectionCard>
            <div className={styles.exampleHead}>
              <span className={styles.exampleName}>Structured</span>
              <span className={styles.exampleKind}>Dua kolom · ringkas</span>
            </div>
            <PreviewFrame address="mystreet.id/p/structured" label="Tata letak Structured">
              <PortfolioSample layout="structured" />
            </PreviewFrame>
          </SectionCard>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
