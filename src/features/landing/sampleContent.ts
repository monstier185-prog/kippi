/**
 * Illustrative sample content for landing-page previews.
 *
 * This is clearly example portfolio content used to show what a finished page
 * looks like — it is NOT presented as a real user, metric, or testimonial, and
 * it is marked as a sample wherever it appears (anti-slop requirement).
 */
export interface SampleExperience {
  role: string;
  org: string;
  period: string;
  description: string;
}

export interface SampleProject {
  name: string;
  description: string;
  tags: string[];
}

export interface SamplePortfolio {
  name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  skills: string[];
  experience: SampleExperience[];
  projects: SampleProject[];
}

export const sampleProfile: SamplePortfolio = {
  name: 'Nadia Rahmawati',
  headline: 'Product Designer',
  summary:
    'Desainer produk dengan fokus pada sistem desain dan riset. Senang menerjemahkan kebutuhan pengguna menjadi antarmuka yang jelas dan terukur.',
  location: 'Bandung, Indonesia',
  email: 'nadia@contoh.id',
  skills: ['Design systems', 'User research', 'Prototyping', 'Figma'],
  experience: [
    {
      role: 'Product Designer',
      org: 'Koala Studio',
      period: '2022 — kini',
      description:
        'Membangun design system lintas tim dan merapikan alur onboarding.',
    },
    {
      role: 'UI Designer',
      org: 'Lanskap Digital',
      period: '2020 — 2022',
      description:
        'Mendesain dashboard analitik dan komponen yang dapat dipakai ulang.',
    },
  ],
  projects: [
    {
      name: 'Peta Layanan Kota',
      description:
        'Penataan ulang navigasi untuk layanan publik agar lebih mudah ditemukan.',
      tags: ['Research', 'IA'],
    },
    {
      name: 'Sistem Komponen Internal',
      description:
        'Pustaka komponen bersama yang mempercepat pembuatan halaman baru.',
      tags: ['Design system'],
    },
  ],
};
