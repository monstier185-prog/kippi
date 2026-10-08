/**
 * Test fixtures for the preview feature. These build a realistic typed
 * Portfolio from real-looking (but clearly test) data, never fabricated UI
 * placeholder content. Shared by the preview test files.
 */
import type { Portfolio, PortfolioSection, ThemeConfig } from '../../models';

export function makeTheme(overrides?: Partial<ThemeConfig>): ThemeConfig {
  return {
    templateId: 'editorial',
    palette: 'navy',
    accent: 'coral',
    typography: 'sans',
    spacingDensity: 'comfortable',
    profileImage: { show: true, shape: 'circle' },
    ...overrides,
  };
}

export function makePortfolio(
  overrides?: Partial<Portfolio>,
): Portfolio {
  const sections: PortfolioSection[] = [
    {
      id: 'sec-profile',
      position: 0,
      isVisible: true,
      type: 'profile',
      content: {
        fullName: 'Dewi Lestari',
        headline: 'Product Designer',
        summary: 'Mendesain produk yang jelas dan mudah dipakai.',
        location: 'Bandung',
      },
    },
    {
      id: 'sec-exp',
      position: 1,
      isVisible: true,
      type: 'experience',
      content: {
        items: [
          {
            id: 'exp-1',
            role: 'Senior Designer',
            organization: 'Studio Terang',
            startDate: '2021',
            isCurrent: true,
            description: 'Memimpin desain untuk tiga produk utama.',
          },
        ],
      },
    },
    {
      id: 'sec-projects',
      position: 2,
      isVisible: true,
      type: 'projects',
      content: {
        items: [
          {
            id: 'proj-1',
            name: 'Aplikasi Rute Kota',
            summary: 'Peta rute transportasi publik.',
            tags: ['Figma', 'Riset'],
            year: '2023',
          },
        ],
      },
    },
    {
      id: 'sec-testi',
      position: 3,
      isVisible: true,
      type: 'testimonials',
      content: {
        items: [
          {
            id: 'testi-1',
            quote: 'Kolaborasi yang luar biasa.',
            author: 'Rizal',
            authorRole: 'Manajer Produk',
          },
        ],
      },
    },
  ];

  return {
    id: 'pf-1',
    ownerId: 'local-user',
    slug: 'dewi-lestari',
    title: 'Portfolio Dewi',
    status: 'draft',
    templateId: 'editorial',
    themeConfig: makeTheme(),
    seoConfig: {},
    sections,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    ...overrides,
  };
}
