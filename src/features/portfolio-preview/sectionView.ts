/**
 * Model-to-view helpers shared by every template.
 *
 * The three templates differ in *structure* but all consume the exact same
 * typed `Portfolio` model through these helpers — there is a single
 * model-to-view contract, so switching template never changes or loses data.
 *
 * Anti-slop rule: a section is only rendered if it is both visible AND has real
 * user-entered content. Empty sections produce NO output (no placeholder / mock
 * copy), honoring "do not show mock content after the user enters real data".
 */
import type { Portfolio, PortfolioSection, SectionType } from '../../models';

/** Human, user-facing Indonesian label per section type. */
export const SECTION_TITLE: Record<SectionType, string> = {
  profile: 'Profil',
  about: 'Tentang',
  experience: 'Pengalaman',
  education: 'Pendidikan',
  skills: 'Keahlian',
  projects: 'Project',
  services: 'Layanan',
  certifications: 'Sertifikasi',
  awards: 'Penghargaan',
  testimonials: 'Testimoni',
  contact: 'Kontak',
  socialLinks: 'Tautan',
};

/** Render mode: a condensed CV (hiring context) or the full portfolio. */
export type PreviewMode = 'portfolio' | 'cv';

/**
 * In CV mode we show the information most relevant to a hiring decision and
 * drop the more portfolio-oriented sections (services, testimonials, social).
 */
const CV_HIDDEN_SECTIONS: ReadonlySet<SectionType> = new Set([
  'services',
  'testimonials',
  'socialLinks',
]);

/** True when a section carries at least one piece of real user content. */
export function sectionHasContent(section: PortfolioSection): boolean {
  switch (section.type) {
    case 'profile': {
      const c = section.content;
      return Boolean(
        c.fullName || c.headline || c.summary || c.location || c.avatarUrl,
      );
    }
    case 'about':
      return Boolean(section.content.body.trim());
    case 'contact': {
      const c = section.content;
      return Boolean(c.email || c.phone || c.location || c.availability);
    }
    case 'experience':
    case 'education':
    case 'skills':
    case 'projects':
    case 'services':
    case 'certifications':
    case 'awards':
    case 'testimonials':
    case 'socialLinks':
      return section.content.items.length > 0;
    default:
      return false;
  }
}

/** The profile section, if present and non-empty (used as the page header). */
export function findProfile(portfolio: Portfolio) {
  const section = portfolio.sections.find(
    (s): s is Extract<PortfolioSection, { type: 'profile' }> =>
      s.type === 'profile',
  );
  if (!section || !section.isVisible || !sectionHasContent(section)) {
    return null;
  }
  return section.content;
}

/**
 * The ordered, renderable sections for a given mode. Returns only sections that
 * are visible, have real content, and are appropriate for the mode. The profile
 * section is handled separately as the header, so it is excluded here.
 */
export function renderableSections(
  portfolio: Portfolio,
  mode: PreviewMode,
): PortfolioSection[] {
  return [...portfolio.sections]
    .sort((a, b) => a.position - b.position)
    .filter((s) => s.type !== 'profile')
    .filter((s) => s.isVisible)
    .filter((s) => sectionHasContent(s))
    .filter((s) => !(mode === 'cv' && CV_HIDDEN_SECTIONS.has(s.type)));
}

/** True when the portfolio has no visible, non-empty content at all. */
export function isPortfolioEmpty(portfolio: Portfolio, mode: PreviewMode): boolean {
  return (
    findProfile(portfolio) === null &&
    renderableSections(portfolio, mode).length === 0
  );
}

/** Format a date range from two free-text date fields + an "ongoing" flag. */
export function formatRange(
  start?: string,
  end?: string,
  isCurrent?: boolean,
): string {
  if (!start && !end && !isCurrent) return '';
  const to = isCurrent ? 'Sekarang' : end ?? '';
  return [start, to].filter(Boolean).join(' – ');
}
