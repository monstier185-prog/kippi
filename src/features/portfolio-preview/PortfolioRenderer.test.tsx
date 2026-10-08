import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Portfolio, PortfolioSection } from '../../models';
import { PortfolioRenderer } from './PortfolioRenderer';
import { makePortfolio, makeTheme } from './testFixtures';

/** The theme-scoped surface, identified by its data-template attribute. */
function surface(container: HTMLElement): HTMLElement {
  const el = container.querySelector('[data-template]');
  if (!(el instanceof HTMLElement)) throw new Error('renderer surface missing');
  return el;
}

describe('PortfolioRenderer', () => {
  it('renders real model content and never fabricates placeholder data', () => {
    render(<PortfolioRenderer portfolio={makePortfolio()} />);
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();
    expect(screen.getByText('Product Designer')).toBeInTheDocument();
    expect(screen.getByText(/Senior Designer/)).toBeInTheDocument();
  });

  it('reflects a model edit without a separate mock path', () => {
    const base = makePortfolio();
    const { rerender } = render(<PortfolioRenderer portfolio={base} />);
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();

    const edited: Portfolio = {
      ...base,
      sections: base.sections.map((s) =>
        s.type === 'profile'
          ? { ...s, content: { ...s.content, fullName: 'Budi Santoso' } }
          : s,
      ),
    };
    rerender(<PortfolioRenderer portfolio={edited} />);
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.queryByText('Dewi Lestari')).not.toBeInTheDocument();
  });

  it('switching template preserves all data but changes structure', () => {
    const editorial = makePortfolio({
      templateId: 'editorial',
      themeConfig: makeTheme({ templateId: 'editorial' }),
    });
    const { container, rerender } = render(
      <PortfolioRenderer portfolio={editorial} />,
    );
    expect(surface(container).dataset.template).toBe('editorial');
    // Editorial is a single reading column: no scannable sidebar...
    expect(container.querySelector('aside')).toBeNull();
    // ...and none of Quiet Studio's structural markers (lede / numbered
    // section composition / one-item-per-row project articles).
    expect(container.querySelector('[data-quiet-lede]')).toBeNull();
    expect(container.querySelector('[data-quiet-section]')).toBeNull();
    expect(container.querySelector('[data-quiet-project]')).toBeNull();

    const structured = makePortfolio({
      templateId: 'structured',
      themeConfig: makeTheme({ templateId: 'structured' }),
    });
    rerender(<PortfolioRenderer portfolio={structured} />);
    expect(surface(container).dataset.template).toBe('structured');

    // Same data is present under the new structure...
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();
    expect(screen.getByText(/Senior Designer/)).toBeInTheDocument();
    expect(screen.getByText('Aplikasi Rute Kota')).toBeInTheDocument();
    // ...and the structure genuinely differs (Structured has a project grid /
    // a scannable sidebar region that Editorial does not render).
    expect(
      container.querySelector('[data-section="experience"]'),
    ).not.toBeNull();

    const quiet = makePortfolio({
      templateId: 'quietStudio',
      themeConfig: makeTheme({ templateId: 'quietStudio' }),
    });
    rerender(<PortfolioRenderer portfolio={quiet} />);
    expect(surface(container).dataset.template).toBe('quietStudio');
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();
    expect(screen.getByText('Aplikasi Rute Kota')).toBeInTheDocument();
    // Quiet Studio is structurally distinct from Editorial in MARKUP, not just
    // CSS: a dedicated lede block, a numbered section composition, and a
    // one-item-per-row project treatment (each project is its own article).
    expect(container.querySelector('[data-quiet-lede]')).not.toBeNull();
    expect(container.querySelector('[data-quiet-section]')).not.toBeNull();
    expect(
      container.querySelector('[data-quiet-projects] article[data-quiet-project]'),
    ).not.toBeNull();
    // The shared Structured-only markers must be absent here.
    expect(container.querySelector('aside')).toBeNull();
  });

  it('CV mode drops portfolio-only sections while portfolio mode keeps them', () => {
    const portfolio = makePortfolio();

    const { rerender } = render(
      <PortfolioRenderer portfolio={portfolio} mode="portfolio" />,
    );
    // Portfolio mode shows testimonials.
    expect(screen.getByText('Kolaborasi yang luar biasa.')).toBeInTheDocument();

    rerender(<PortfolioRenderer portfolio={portfolio} mode="cv" />);
    // CV mode hides testimonials but keeps experience (hiring-relevant).
    expect(
      screen.queryByText('Kolaborasi yang luar biasa.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Senior Designer/)).toBeInTheDocument();
  });

  it('skips empty / hidden sections instead of showing mock content', () => {
    const sections: PortfolioSection[] = [
      {
        id: 'sec-profile',
        position: 0,
        isVisible: true,
        type: 'profile',
        content: { fullName: 'Sari' },
      },
      // An empty experience section must produce no output.
      {
        id: 'sec-exp',
        position: 1,
        isVisible: true,
        type: 'experience',
        content: { items: [] },
      },
      // A hidden about section must not render even with content.
      {
        id: 'sec-about',
        position: 2,
        isVisible: false,
        type: 'about',
        content: { body: 'Teks tersembunyi' },
      },
    ];
    render(<PortfolioRenderer portfolio={makePortfolio({ sections })} />);
    expect(screen.getByText('Sari')).toBeInTheDocument();
    expect(screen.queryByText('Pengalaman')).not.toBeInTheDocument();
    expect(screen.queryByText('Teks tersembunyi')).not.toBeInTheDocument();
  });

  it('shows an honest empty note when there is no visible content', () => {
    render(<PortfolioRenderer portfolio={makePortfolio({ sections: [] })} />);
    expect(screen.getByText(/Belum ada isi untuk ditampilkan/)).toBeInTheDocument();
  });

  it('falls back to a known template for an unknown templateId (no broken render)', () => {
    const portfolio = makePortfolio({
      templateId: 'does-not-exist',
      themeConfig: makeTheme({ templateId: 'does-not-exist' }),
    });
    const { container } = render(<PortfolioRenderer portfolio={portfolio} />);
    // Resolves to the default (editorial) rather than rendering nothing.
    expect(surface(container).dataset.template).toBe('editorial');
    expect(screen.getByText('Dewi Lestari')).toBeInTheDocument();
  });
});
