/**
 * Structured template (spec 6.5): scannable, multi-column. A compact profile
 * header, then a two-column body — a sidebar for at-a-glance sections (skills,
 * contact, education, certifications, social) and a main column where
 * experience reads as a timeline and projects lay out in a grid. Built for
 * quick scanning rather than linear reading.
 */
import { ProfileHeader } from './ProfileHeader';
import { SectionBody } from '../SectionBlocks';
import {
  renderableSections,
  SECTION_TITLE,
  type PreviewMode,
} from '../sectionView';
import type { PortfolioSection, SectionType } from '../../../models';
import type { TemplateProps } from './templateTypes';
import styles from './StructuredTemplate.module.css';

/** Sections that belong in the scannable sidebar. */
const SIDEBAR: ReadonlySet<SectionType> = new Set([
  'skills',
  'contact',
  'education',
  'certifications',
  'awards',
  'socialLinks',
]);

function split(sections: PortfolioSection[]) {
  const main: PortfolioSection[] = [];
  const aside: PortfolioSection[] = [];
  for (const s of sections) {
    (SIDEBAR.has(s.type) ? aside : main).push(s);
  }
  return { main, aside };
}

function Block({
  section,
  mode,
}: {
  section: PortfolioSection;
  mode: PreviewMode;
}) {
  const isTimeline = section.type === 'experience';
  const isGrid = section.type === 'projects' || section.type === 'services';
  return (
    <section
      className={`${styles.block} ${isTimeline ? styles.timeline : ''}`}
      data-section={section.type}
    >
      <h2 className={styles.heading}>{SECTION_TITLE[section.type]}</h2>
      <SectionBody
        section={section}
        layout={isGrid && mode === 'portfolio' ? 'grid' : 'flow'}
      />
    </section>
  );
}

export function StructuredTemplate({ portfolio, mode, theme }: TemplateProps) {
  const profile = portfolio.sections.find((s) => s.type === 'profile');
  const sections = renderableSections(portfolio, mode);
  const { main, aside } = split(sections);
  const profileContent =
    profile && profile.type === 'profile' && profile.isVisible
      ? profile.content
      : null;

  return (
    <div className={styles.root} data-template="structured">
      {profileContent ? (
        <ProfileHeader profile={profileContent} theme={theme} variant="inline" />
      ) : null}
      <div className={styles.body}>
        <div className={styles.main}>
          {main.map((section) => (
            <Block key={section.id} section={section} mode={mode} />
          ))}
        </div>
        {aside.length ? (
          <aside className={styles.aside}>
            {aside.map((section) => (
              <Block key={section.id} section={section} mode={mode} />
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export default StructuredTemplate;
