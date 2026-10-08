/**
 * Client-side zod schemas for the portfolio domain model.
 *
 * These validate shapes read from local storage and user input before they are
 * trusted. In a local-first app there is no server round-trip, so this is the
 * only validation boundary; server-side validation is N/A (documented in
 * docs/SECURITY_REVIEW.md). The schemas are kept structurally in sync with the
 * TypeScript types in `types.ts`.
 */
import { z } from 'zod';
import type {
  Portfolio,
  PortfolioSection,
  PublicationStatus,
  SectionType,
} from './types';

export const publicationStatusSchema: z.ZodType<PublicationStatus> = z.enum([
  'draft',
  'published',
  'private',
]);

export const sectionTypeSchema: z.ZodType<SectionType> = z.enum([
  'profile',
  'about',
  'experience',
  'education',
  'skills',
  'projects',
  'services',
  'certifications',
  'awards',
  'testimonials',
  'contact',
  'socialLinks',
]);

const socialLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

const experienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  organization: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  qualification: z.string(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  year: z.string().optional(),
  tags: z.array(z.string()),
  url: z.string().optional(),
  repositoryUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  outcomes: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  group: z.string().optional(),
});

const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  issueDate: z.string().optional(),
  credentialUrl: z.string().optional(),
});

const awardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

const testimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  author: z.string(),
  authorRole: z.string().optional(),
});

const profileContentSchema = z.object({
  fullName: z.string(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const aboutContentSchema = z.object({ body: z.string() });
const experienceContentSchema = z.object({ items: z.array(experienceSchema) });
const educationContentSchema = z.object({ items: z.array(educationSchema) });
const skillsContentSchema = z.object({ items: z.array(skillSchema) });
const projectsContentSchema = z.object({ items: z.array(projectSchema) });
const servicesContentSchema = z.object({ items: z.array(serviceSchema) });
const certificationsContentSchema = z.object({
  items: z.array(certificationSchema),
});
const awardsContentSchema = z.object({ items: z.array(awardSchema) });
const testimonialsContentSchema = z.object({
  items: z.array(testimonialSchema),
});
const contactContentSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  availability: z.string().optional(),
});
const socialLinksContentSchema = z.object({ items: z.array(socialLinkSchema) });

const sectionBase = { id: z.string(), position: z.number(), isVisible: z.boolean() };

export const portfolioSectionSchema: z.ZodType<PortfolioSection> =
  z.discriminatedUnion('type', [
    z.object({ ...sectionBase, type: z.literal('profile'), content: profileContentSchema }),
    z.object({ ...sectionBase, type: z.literal('about'), content: aboutContentSchema }),
    z.object({ ...sectionBase, type: z.literal('experience'), content: experienceContentSchema }),
    z.object({ ...sectionBase, type: z.literal('education'), content: educationContentSchema }),
    z.object({ ...sectionBase, type: z.literal('skills'), content: skillsContentSchema }),
    z.object({ ...sectionBase, type: z.literal('projects'), content: projectsContentSchema }),
    z.object({ ...sectionBase, type: z.literal('services'), content: servicesContentSchema }),
    z.object({ ...sectionBase, type: z.literal('certifications'), content: certificationsContentSchema }),
    z.object({ ...sectionBase, type: z.literal('awards'), content: awardsContentSchema }),
    z.object({ ...sectionBase, type: z.literal('testimonials'), content: testimonialsContentSchema }),
    z.object({ ...sectionBase, type: z.literal('contact'), content: contactContentSchema }),
    z.object({ ...sectionBase, type: z.literal('socialLinks'), content: socialLinksContentSchema }),
  ]) as z.ZodType<PortfolioSection>;

export const themeConfigSchema = z.object({
  templateId: z.string(),
  palette: z.enum(['navy', 'coral', 'mono']),
  accentColor: z.string().optional(),
  fontScale: z.enum(['compact', 'comfortable']).optional(),
  accent: z.enum(['coral', 'navy', 'teal', 'plum']).optional(),
  typography: z.enum(['sans', 'humanist', 'mono-accent']).optional(),
  spacingDensity: z.enum(['compact', 'comfortable', 'spacious']).optional(),
  profileImage: z
    .object({
      show: z.boolean(),
      shape: z.enum(['circle', 'rounded', 'square']),
    })
    .optional(),
});

export const seoConfigSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImageUrl: z.string().optional(),
  noindex: z.boolean().optional(),
});

export const portfolioSchema: z.ZodType<Portfolio> = z.object({
  id: z.string(),
  ownerId: z.string(),
  slug: z.string(),
  title: z.string(),
  status: publicationStatusSchema,
  templateId: z.string(),
  themeConfig: themeConfigSchema,
  seoConfig: seoConfigSchema,
  sections: z.array(portfolioSectionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().optional(),
  deletedAt: z.string().optional(),
}) as z.ZodType<Portfolio>;

/** Validation for the title field used by create / rename flows. */
export const portfolioTitleSchema = z
  .string()
  .trim()
  .min(1, 'Judul tidak boleh kosong')
  .max(120, 'Judul maksimal 120 karakter');
