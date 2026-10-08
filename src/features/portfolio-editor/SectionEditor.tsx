/**
 * Dispatches an active section to the correct typed form. The discriminated
 * union on `section.type` lets TypeScript narrow each case so every form only
 * ever receives the section shape it understands.
 */
import type { PortfolioSection } from '../../models';
import type { FieldErrors } from './validation';
import { ProfileForm } from './forms/ProfileForm';
import { AboutForm } from './forms/AboutForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { ServicesForm } from './forms/ServicesForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { AwardsForm } from './forms/AwardsForm';
import { TestimonialsForm } from './forms/TestimonialsForm';
import { ContactForm } from './forms/ContactForm';
import { SocialLinksForm } from './forms/SocialLinksForm';

export interface SectionEditorProps {
  section: PortfolioSection;
  onChange: (next: PortfolioSection) => void;
  errors: FieldErrors;
}

export function SectionEditor({ section, onChange, errors }: SectionEditorProps) {
  switch (section.type) {
    case 'profile':
      return <ProfileForm section={section} onChange={onChange} errors={errors} />;
    case 'about':
      return <AboutForm section={section} onChange={onChange} errors={errors} />;
    case 'experience':
      return (
        <ExperienceForm section={section} onChange={onChange} errors={errors} />
      );
    case 'education':
      return (
        <EducationForm section={section} onChange={onChange} errors={errors} />
      );
    case 'skills':
      return <SkillsForm section={section} onChange={onChange} errors={errors} />;
    case 'projects':
      return (
        <ProjectsForm section={section} onChange={onChange} errors={errors} />
      );
    case 'services':
      return (
        <ServicesForm section={section} onChange={onChange} errors={errors} />
      );
    case 'certifications':
      return (
        <CertificationsForm
          section={section}
          onChange={onChange}
          errors={errors}
        />
      );
    case 'awards':
      return <AwardsForm section={section} onChange={onChange} errors={errors} />;
    case 'testimonials':
      return (
        <TestimonialsForm
          section={section}
          onChange={onChange}
          errors={errors}
        />
      );
    case 'contact':
      return <ContactForm section={section} onChange={onChange} errors={errors} />;
    case 'socialLinks':
      return (
        <SocialLinksForm section={section} onChange={onChange} errors={errors} />
      );
    default: {
      const never: never = section;
      throw new Error(`Unhandled section: ${JSON.stringify(never)}`);
    }
  }
}

export default SectionEditor;
