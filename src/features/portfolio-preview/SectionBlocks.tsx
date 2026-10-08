/**
 * Shared content blocks for a single section's body.
 *
 * Templates own the *layout* (how blocks are arranged — single column, grid,
 * timeline, whitespace). This module owns the *content* rendering for each
 * section type, so all three templates stay consistent and no section data is
 * ever dropped when switching template. All user text is rendered as React
 * children (escaped by React), never via dangerouslySetInnerHTML.
 */
import type { PortfolioSection } from '../../models';
import { safeMailto, safeUrl } from '../../lib/sanitize';
import { formatRange } from './sectionView';
import styles from './SectionBlocks.module.css';

const SKILL_LEVEL_LABEL: Record<string, string> = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Mahir',
  expert: 'Ahli',
};

export interface SectionBodyProps {
  section: PortfolioSection;
  /** `grid` lets project / card sections lay out in multiple columns. */
  layout?: 'flow' | 'grid';
}

/** Render the body of any non-profile section. */
export function SectionBody({ section, layout = 'flow' }: SectionBodyProps) {
  switch (section.type) {
    case 'about':
      return <p className={styles.prose}>{section.content.body}</p>;

    case 'experience':
      return (
        <ul className={styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <span className={styles.entryTitle}>
                  {[it.role, it.organization].filter(Boolean).join(' · ')}
                </span>
                {formatRange(it.startDate, it.endDate, it.isCurrent) ? (
                  <span className={styles.entryMeta}>
                    {formatRange(it.startDate, it.endDate, it.isCurrent)}
                  </span>
                ) : null}
              </div>
              {it.location ? (
                <span className={styles.entrySub}>{it.location}</span>
              ) : null}
              {it.description ? (
                <p className={styles.entryBody}>{it.description}</p>
              ) : null}
              {it.highlights && it.highlights.length ? (
                <ul className={styles.bullets}>
                  {it.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : null}
              {it.technologies && it.technologies.length ? (
                <ul className={styles.tags}>
                  {it.technologies.map((t, i) => (
                    <li key={i} className={styles.tag}>
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'education':
      return (
        <ul className={styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <span className={styles.entryTitle}>
                  {[it.qualification, it.fieldOfStudy]
                    .filter(Boolean)
                    .join(', ')}
                </span>
                {formatRange(it.startDate, it.endDate) ? (
                  <span className={styles.entryMeta}>
                    {formatRange(it.startDate, it.endDate)}
                  </span>
                ) : null}
              </div>
              {it.institution ? (
                <span className={styles.entrySub}>{it.institution}</span>
              ) : null}
              {it.description ? (
                <p className={styles.entryBody}>{it.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'skills':
      return (
        <ul className={styles.tags}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.tag}>
              {it.name}
              {it.level ? (
                <span className={styles.tagMeta}>
                  {' '}
                  · {SKILL_LEVEL_LABEL[it.level] ?? it.level}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'projects':
      return (
        <ul
          className={layout === 'grid' ? styles.projectGrid : styles.entries}
        >
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.project}>
              <div className={styles.entryHead}>
                <span className={styles.entryTitle}>{it.name}</span>
                {it.year ? (
                  <span className={styles.entryMeta}>{it.year}</span>
                ) : null}
              </div>
              {it.summary ? (
                <p className={styles.entrySub}>{it.summary}</p>
              ) : null}
              {it.role ? (
                <span className={styles.entrySub}>Peran: {it.role}</span>
              ) : null}
              {it.description ? (
                <p className={styles.entryBody}>{it.description}</p>
              ) : null}
              {it.outcomes ? (
                <p className={styles.entryBody}>{it.outcomes}</p>
              ) : null}
              {it.tags && it.tags.length ? (
                <ul className={styles.tags}>
                  {it.tags.map((t, i) => (
                    <li key={i} className={styles.tag}>
                      {t}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={styles.links}>
                {safeUrl(it.url) ? (
                  <a
                    className={styles.link}
                    href={safeUrl(it.url)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Lihat project
                  </a>
                ) : null}
                {safeUrl(it.repositoryUrl) ? (
                  <a
                    className={styles.link}
                    href={safeUrl(it.repositoryUrl)}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Repositori
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      );

    case 'services':
      return (
        <ul className={layout === 'grid' ? styles.projectGrid : styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.entry}>
              <span className={styles.entryTitle}>{it.name}</span>
              {it.description ? (
                <p className={styles.entryBody}>{it.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'certifications':
      return (
        <ul className={styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <span className={styles.entryTitle}>{it.name}</span>
                {it.issueDate ? (
                  <span className={styles.entryMeta}>{it.issueDate}</span>
                ) : null}
              </div>
              {it.issuer ? (
                <span className={styles.entrySub}>{it.issuer}</span>
              ) : null}
              {safeUrl(it.credentialUrl) ? (
                <a
                  className={styles.link}
                  href={safeUrl(it.credentialUrl)}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Lihat kredensial
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'awards':
      return (
        <ul className={styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.entry}>
              <div className={styles.entryHead}>
                <span className={styles.entryTitle}>{it.title}</span>
                {it.date ? (
                  <span className={styles.entryMeta}>{it.date}</span>
                ) : null}
              </div>
              {it.issuer ? (
                <span className={styles.entrySub}>{it.issuer}</span>
              ) : null}
              {it.description ? (
                <p className={styles.entryBody}>{it.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      );

    case 'testimonials':
      return (
        <ul className={styles.entries}>
          {section.content.items.map((it) => (
            <li key={it.id} className={styles.testimonial}>
              <blockquote className={styles.quote}>{it.quote}</blockquote>
              <cite className={styles.cite}>
                {[it.author, it.authorRole].filter(Boolean).join(', ')}
              </cite>
            </li>
          ))}
        </ul>
      );

    case 'contact': {
      const c = section.content;
      const rows: Array<[string, string]> = [];
      if (c.email) rows.push(['Email', c.email]);
      if (c.phone) rows.push(['Telepon', c.phone]);
      if (c.location) rows.push(['Lokasi', c.location]);
      if (c.availability) rows.push(['Ketersediaan', c.availability]);
      return (
        <dl className={styles.contact}>
          {rows.map(([label, value]) => {
            // Keep the contact email on the same allow-list path as every
            // other user href: build the mailto via safeMailto. If the address
            // is malformed/unsafe, show it as plain text (never a bad href).
            const mailtoHref = label === 'Email' ? safeMailto(value) : undefined;
            return (
              <div key={label} className={styles.contactRow}>
                <dt className={styles.contactLabel}>{label}</dt>
                <dd className={styles.contactValue}>
                  {mailtoHref ? (
                    <a className={styles.link} href={mailtoHref}>
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      );
    }

    case 'socialLinks':
      return (
        <ul className={styles.socials}>
          {section.content.items.map((it) => {
            const href = safeUrl(it.url);
            // If a link's URL is not a safe scheme, show the label as plain
            // text rather than rendering an unsafe/clickable href.
            return (
              <li key={it.id}>
                {href ? (
                  <a
                    className={styles.link}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {it.label || it.url}
                  </a>
                ) : (
                  <span>{it.label || it.url}</span>
                )}
              </li>
            );
          })}
        </ul>
      );

    default:
      return null;
  }
}

export default SectionBody;
