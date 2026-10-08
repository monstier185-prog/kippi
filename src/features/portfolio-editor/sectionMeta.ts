/**
 * Section metadata for the editor: a human label per section type and a factory
 * that produces an empty content shape. These are the ONLY defaults the editor
 * uses when a user adds a section — they are always empty (no fabricated data),
 * matching the anti-AI-slop rule. Example text lives only in input placeholders
 * (prefixed "Contoh:") and is never written into the model.
 */
import type { SectionContent, SectionType } from '../../models';

/** Clear, user-facing Indonesian labels for every section type. */
export const SECTION_LABEL: Record<SectionType, string> = {
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
  socialLinks: 'Tautan sosial',
};

/** A short description shown under each section in the editor nav / add menu. */
export const SECTION_DESCRIPTION: Record<SectionType, string> = {
  profile: 'Nama, titel, dan bio singkat.',
  about: 'Narasi lebih panjang tentang dirimu.',
  experience: 'Riwayat pekerjaan dan peran.',
  education: 'Riwayat pendidikan.',
  skills: 'Keahlian dan alat yang kamu kuasai.',
  projects: 'Karya atau project terbaikmu.',
  services: 'Layanan yang kamu tawarkan.',
  certifications: 'Sertifikat dan kredensial.',
  awards: 'Penghargaan dan pengakuan.',
  testimonials: 'Testimoni dari orang nyata.',
  contact: 'Cara menghubungimu.',
  socialLinks: 'Tautan ke profil lain.',
};

/** The order sections are offered in the "add section" menu. */
export const SECTION_ORDER: SectionType[] = [
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
];

/**
 * Build an empty content object for a given section type. Every field is blank
 * or an empty array; nothing is pre-filled with example data.
 */
export function emptyContent(type: SectionType): SectionContent {
  switch (type) {
    case 'profile':
      return { type, content: { fullName: '' } };
    case 'about':
      return { type, content: { body: '' } };
    case 'experience':
      return { type, content: { items: [] } };
    case 'education':
      return { type, content: { items: [] } };
    case 'skills':
      return { type, content: { items: [] } };
    case 'projects':
      return { type, content: { items: [] } };
    case 'services':
      return { type, content: { items: [] } };
    case 'certifications':
      return { type, content: { items: [] } };
    case 'awards':
      return { type, content: { items: [] } };
    case 'testimonials':
      return { type, content: { items: [] } };
    case 'contact':
      return { type, content: {} };
    case 'socialLinks':
      return { type, content: { items: [] } };
    default: {
      // Exhaustiveness guard: adding a new SectionType forces a case here.
      const never: never = type;
      throw new Error(`Unhandled section type: ${String(never)}`);
    }
  }
}
