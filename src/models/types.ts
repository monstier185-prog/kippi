/**
 * MyStreet.id typed domain model.
 *
 * These types are the single source of truth for the shape of a portfolio and
 * its sections. Field names mirror the spec (Sections 8.1–8.3 content types and
 * Section 10 data model). The persisted data model in Section 10 lists
 * snake_case columns (user_id, template_id, theme_config, …); in this
 * local-first client app we use the camelCase equivalents (templateId,
 * themeConfig, …) consistently across the TypeScript layer. The repository is
 * the single boundary that would map these to any future server schema.
 *
 * There is no server or database (local-first). A single conceptual local user
 * owns everything in this browser; ownership, privacy, and publish rules are
 * enforced honestly at the repository level (see portfolioRepository.ts).
 */

/** Publication status of a portfolio (spec Section 10: draft|published|private). */
export type PublicationStatus = 'draft' | 'published' | 'private';

/** The known section kinds a portfolio can contain (spec Section 8.1). */
export type SectionType =
  | 'profile'
  | 'about'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'services'
  | 'certifications'
  | 'awards'
  | 'testimonials'
  | 'contact'
  | 'socialLinks';

/** Save state surfaced to the editor UI. */
export type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

/** A single social profile link (spec Section 8.3). */
export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

/** One work-experience entry (spec Section 8.2). */
export interface Experience {
  id: string;
  role: string;
  organization: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  highlights?: string[];
  /** Technologies / skills used in this role (spec 8.2, optional). */
  technologies?: string[];
}

/** One education entry. */
export interface Education {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

/** One project / work sample (spec Section 8.3). */
export interface Project {
  id: string;
  name: string;
  /** One-line summary (spec 8.3). */
  summary?: string;
  description?: string;
  role?: string;
  /** Year the project was done (spec 8.3). */
  year?: string;
  /** Tools / technologies used. Mirrors `tags` kept for backwards shape. */
  tags: string[];
  /** Live project URL (spec 8.3). */
  url?: string;
  /** Repository URL (spec 8.3, optional). */
  repositoryUrl?: string;
  /** Cover image URL (spec 8.3, optional). */
  coverImageUrl?: string;
  /** Outcomes / results (spec 8.3, optional). */
  outcomes?: string;
  startDate?: string;
  endDate?: string;
}

/** A single named skill, optionally grouped and leveled. */
export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  group?: string;
}

/** A service offered (freelance / consulting portfolios). */
export interface Service {
  id: string;
  name: string;
  description?: string;
}

/** A professional certification. */
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate?: string;
  credentialUrl?: string;
}

/** An award or recognition. */
export interface Award {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

/**
 * A testimonial. The author is always a real, user-entered attribution — the
 * app never fabricates testimonials (anti-slop requirement).
 */
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  authorRole?: string;
}

/* --- Section content types (one per SectionType) --- */

export interface ProfileContent {
  fullName: string;
  headline?: string;
  summary?: string;
  location?: string;
  avatarUrl?: string;
}

export interface AboutContent {
  body: string;
}

export interface ExperienceContent {
  items: Experience[];
}

export interface EducationContent {
  items: Education[];
}

export interface SkillsContent {
  items: Skill[];
}

export interface ProjectsContent {
  items: Project[];
}

export interface ServicesContent {
  items: Service[];
}

export interface CertificationsContent {
  items: Certification[];
}

export interface AwardsContent {
  items: Award[];
}

export interface TestimonialsContent {
  items: Testimonial[];
}

export interface ContactContent {
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
}

export interface SocialLinksContent {
  items: SocialLink[];
}

/** Discriminated union mapping each section type to its content shape. */
export type SectionContent =
  | { type: 'profile'; content: ProfileContent }
  | { type: 'about'; content: AboutContent }
  | { type: 'experience'; content: ExperienceContent }
  | { type: 'education'; content: EducationContent }
  | { type: 'skills'; content: SkillsContent }
  | { type: 'projects'; content: ProjectsContent }
  | { type: 'services'; content: ServicesContent }
  | { type: 'certifications'; content: CertificationsContent }
  | { type: 'awards'; content: AwardsContent }
  | { type: 'testimonials'; content: TestimonialsContent }
  | { type: 'contact'; content: ContactContent }
  | { type: 'socialLinks'; content: SocialLinksContent };

/**
 * A section within a portfolio. `position` drives ordering and `isVisible`
 * toggles rendering without deleting the content (spec Section 10
 * portfolio_sections: section_type, position, is_visible, content_json).
 */
export type PortfolioSection = {
  id: string;
  position: number;
  isVisible: boolean;
} & SectionContent;

/**
 * The three structurally-distinct templates (spec Section 6.5). These are the
 * ONLY template ids; the renderer switches whole layout structure on them, not
 * just color.
 */
export type TemplateId = 'editorial' | 'structured' | 'quietStudio';

/**
 * The constrained accent palette (spec Sesi 6). Every accent is anchored on the
 * brand (navy / coral) and is pre-verified to keep text contrast valid against
 * the surfaces, so no choice here can break readability.
 */
export type AccentId = 'coral' | 'navy' | 'teal' | 'plum';

/** The limited set of typography pairings offered (spec Sesi 6). */
export type TypographyPairingId = 'sans' | 'humanist' | 'mono-accent';

/** Spacing density options (spec Sesi 6). */
export type SpacingDensity = 'compact' | 'comfortable' | 'spacious';

/** How the profile image is presented. Photo always remains optional. */
export type ProfileImageShape = 'circle' | 'rounded' | 'square';

/** Theme configuration applied when rendering a portfolio (spec theme_config). */
export interface ThemeConfig {
  templateId: string;
  palette: 'navy' | 'coral' | 'mono';
  accentColor?: string;
  fontScale?: 'compact' | 'comfortable';
  /** Accent chosen from the constrained, contrast-safe palette (spec Sesi 6). */
  accent?: AccentId;
  /** Typography pairing (spec Sesi 6). */
  typography?: TypographyPairingId;
  /** Spacing density (spec Sesi 6). */
  spacingDensity?: SpacingDensity;
  /** Profile-image behavior — photo is optional, so visibility is a toggle. */
  profileImage?: {
    show: boolean;
    shape: ProfileImageShape;
  };
}

/** SEO configuration for the public page (spec seo_config). */
export interface SeoConfig {
  title?: string;
  description?: string;
  ogImageUrl?: string;
  noindex?: boolean;
}

/**
 * A portfolio aggregate (spec Section 10 `portfolios`).
 *
 * `ownerId` models the single local user so the ownership rules in Section 10.1
 * are honored even without a server. `deletedAt` implements soft-delete /
 * retention — a soft-deleted portfolio is retained but hidden from normal
 * listings until it is purged.
 */
export interface Portfolio {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  status: PublicationStatus;
  templateId: string;
  themeConfig: ThemeConfig;
  seoConfig: SeoConfig;
  sections: PortfolioSection[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  /** Soft-delete marker; set when the portfolio is moved to the trash. */
  deletedAt?: string;
}

/** A single field-level validation failure (spec ValidationError). */
export interface ValidationError {
  path: string;
  message: string;
}
