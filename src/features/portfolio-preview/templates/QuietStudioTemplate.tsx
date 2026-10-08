/**
 * Quiet Studio template (spec 6.5): whitespace-heavy and minimal, oriented to
 * visual work.
 *
 * This template is deliberately distinct from Editorial at the MARKUP level,
 * not only in CSS:
 *  - A dedicated lede/intro block wraps the profile with a quiet studio
 *    introduction line (`<div data-quiet-lede>`), rather than a bare header.
 *  - Sections are laid out as a two-part composition (`<section
 *    data-quiet-section>`): a numbered index + quiet label column, then the
 *    section body — not the flat stacked `<section>` list Editorial renders.
 *  - Project sections get a one-item-per-row treatment: each project is its
 *    own `<article data-quiet-project>` with generous whitespace, instead of
 *    the shared project block. This is handled here (structure), while shared
 *    non-project content still flows through `SectionBody` (the single
 *    model-to-view contract, so switching template never drops data).
 */
import type { Project } from '../../../models';
import { ProfileHeader } from './ProfileHeader';
import { SectionBody } from '../SectionBlocks';
import { safeUrl } from '../../../lib/sanitize';
import { renderableSections, SECTION_TITLE } from '../sectionView';
import type { TemplateProps } from './templateTypes';
import styles from './QuietStudioTemplate.module.css';

/** Zero-padded index used as the quiet section marker (01, 02, ...). */
function marker(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/** One-item-per-row project treatment unique to Quiet Studio. */
function QuietProject({ item }: { item: Project }) {
  const projectUrl = safeUrl(item.url);
  const repoUrl = safeUrl(item.repositoryUrl);
  return (
    <article className={styles.project} data-quiet-project>
      <div className={styles.projectHead}>
        <h3 className={styles.projectName}>{item.name}</h3>
        {item.year ? <span className={styles.projectYear}>{item.year}</span> : null}
      </div>
      {item.summary ? <p className={styles.projectSummary}>{item.summary}</p> : null}
      {item.role ? (
        <p className={styles.projectMeta}>Peran: {item.role}</p>
      ) : null}
      {item.description ? (
        <p className={styles.projectBody}>{item.description}</p>
      ) : null}
      {item.outcomes ? (
        <p className={styles.projectBody}>{item.outcomes}</p>
      ) : null}
      {item.tags && item.tags.length ? (
        <ul className={styles.projectTags}>
          {item.tags.map((t, i) => (
            <li key={i} className={styles.projectTag}>
              {t}
            </li>
          ))}
        </ul>
      ) : null}
      {projectUrl || repoUrl ? (
        <div className={styles.projectLinks}>
          {projectUrl ? (
            <a
              className={styles.link}
              href={projectUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Lihat project
            </a>
          ) : null}
          {repoUrl ? (
            <a
              className={styles.link}
              href={repoUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Repositori
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function QuietStudioTemplate({ portfolio, mode, theme }: TemplateProps) {
  const profile = portfolio.sections.find((s) => s.type === 'profile');
  const sections = renderableSections(portfolio, mode);
  const profileContent =
    profile && profile.type === 'profile' && profile.isVisible
      ? profile.content
      : null;

  return (
    <div className={styles.root} data-template="quietStudio">
      {profileContent ? (
        <div className={styles.lede} data-quiet-lede>
          <p className={styles.ledeKicker}>Studio portfolio</p>
          <ProfileHeader
            profile={profileContent}
            theme={theme}
            variant="lede"
          />
        </div>
      ) : null}
      {sections.map((section, index) => (
        <section
          key={section.id}
          className={styles.section}
          data-quiet-section
        >
          <div className={styles.sectionLabel}>
            <span className={styles.sectionMarker} aria-hidden="true">
              {marker(index)}
            </span>
            <h2 className={styles.heading}>{SECTION_TITLE[section.type]}</h2>
          </div>
          <div className={styles.content}>
            {section.type === 'projects' ? (
              <div className={styles.projectList} data-quiet-projects>
                {section.content.items.map((item) => (
                  <QuietProject key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <SectionBody section={section} layout="flow" />
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default QuietStudioTemplate;
