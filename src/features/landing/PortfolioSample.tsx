import styles from './PortfolioSample.module.css';
import { sampleProfile } from './sampleContent';

export type SampleLayout = 'editorial' | 'structured';

export interface PortfolioSampleProps {
  layout?: SampleLayout;
}

/**
 * A realistic portfolio rendered from real markup and the shared sample
 * content. It demonstrates an actual layout the editor can produce — not a
 * screenshot, and not fabricated stats or testimonials. Two structurally
 * different layouts are offered so the previews on the landing page are honest
 * about what the templates look like.
 */
export function PortfolioSample({ layout = 'editorial' }: PortfolioSampleProps) {
  const p = sampleProfile;

  if (layout === 'structured') {
    return (
      <article className={styles.sample}>
        <div className={styles.structured}>
          <aside className={styles.sidebar}>
            <div>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.role}>{p.headline}</div>
            </div>
            <div className={styles.contact}>
              <span>{p.location}</span>
              <span>{p.email}</span>
            </div>
            <div>
              <h4 className={styles.sectionTitle}>Keahlian</h4>
              <ul className={styles.tags}>
                {p.skills.map((skill) => (
                  <li key={skill} className={styles.tag}>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          <div className={styles.main}>
            <div>
              <h4 className={styles.sectionTitle}>Pengalaman</h4>
              {p.experience.map((exp) => (
                <div key={exp.role + exp.org} className={styles.entry}>
                  <div className={styles.entryHead}>
                    <span>
                      {exp.role} · {exp.org}
                    </span>
                    <span className={styles.entryMeta}>{exp.period}</span>
                  </div>
                  <p className={styles.entryDesc}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.sample} ${styles.editorial}`}>
      <header>
        <div className={styles.role}>{p.headline}</div>
        <div className={styles.name}>{p.name}</div>
        <p className={styles.summary}>{p.summary}</p>
      </header>
      <section>
        <h4 className={styles.sectionTitle}>Pengalaman</h4>
        {p.experience.map((exp) => (
          <div key={exp.role + exp.org} className={styles.entry}>
            <div className={styles.entryHead}>
              <span>
                {exp.role} · {exp.org}
              </span>
              <span className={styles.entryMeta}>{exp.period}</span>
            </div>
            <p className={styles.entryDesc}>{exp.description}</p>
          </div>
        ))}
      </section>
      <section>
        <h4 className={styles.sectionTitle}>Karya</h4>
        {p.projects.map((proj) => (
          <div key={proj.name} className={styles.entry}>
            <div className={styles.entryHead}>
              <span>{proj.name}</span>
            </div>
            <p className={styles.entryDesc}>{proj.description}</p>
            <ul className={styles.tags}>
              {proj.tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </article>
  );
}

export default PortfolioSample;
