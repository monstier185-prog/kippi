/**
 * Editorial template (spec 6.5): typography-led, single long reading column.
 * Structure: a lede profile, then stacked sections separated by generous
 * vertical rhythm and a small serif-style section label. No grids, no cards —
 * the emphasis is a continuous reading flow suited to writing-heavy portfolios.
 */
import { ProfileHeader } from './ProfileHeader';
import { SectionBody } from '../SectionBlocks';
import { renderableSections, SECTION_TITLE } from '../sectionView';
import type { TemplateProps } from './templateTypes';
import styles from './EditorialTemplate.module.css';

export function EditorialTemplate({ portfolio, mode, theme }: TemplateProps) {
  const profile = portfolio.sections.find((s) => s.type === 'profile');
  const sections = renderableSections(portfolio, mode);
  const profileContent =
    profile && profile.type === 'profile' && profile.isVisible
      ? profile.content
      : null;

  return (
    <div className={styles.root} data-template="editorial">
      {profileContent ? (
        <ProfileHeader profile={profileContent} theme={theme} variant="stacked" />
      ) : null}
      {sections.map((section) => (
        <section key={section.id} className={styles.section}>
          <h2 className={styles.heading}>{SECTION_TITLE[section.type]}</h2>
          <SectionBody section={section} layout="flow" />
        </section>
      ))}
    </div>
  );
}

export default EditorialTemplate;
