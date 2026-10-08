/**
 * Editor-side field validation.
 *
 * The persisted zod schemas (src/models/schemas.ts) describe the stored shape
 * but are deliberately permissive about *required-ness* for drafts (a draft may
 * be incomplete and still save). The editor adds a thin layer of human-facing,
 * actionable required-field + format checks on top, keyed by a dotted field
 * path so each message can be wired to the matching input via `aria-describedby`.
 *
 * Validation never blocks autosave of a draft — it only surfaces guidance so a
 * user knows what to fix before publishing. Errors are returned as a map from
 * field path to a single actionable message.
 */
import type { PortfolioSection } from '../../models';

export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accept http(s) URLs; keep it forgiving (users may paste without scheme).
const URL_RE = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i;

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validate a single section's content. Returns a map of field path -> message.
 * Paths use the same shape the forms build (e.g. `fullName`, `items.0.role`).
 */
export function validateSection(section: PortfolioSection): FieldErrors {
  const errors: FieldErrors = {};

  switch (section.type) {
    case 'profile': {
      const c = section.content;
      if (isBlank(c.fullName)) {
        errors.fullName = 'Nama lengkap wajib diisi.';
      }
      if (!isBlank(c.avatarUrl) && !URL_RE.test(c.avatarUrl!.trim())) {
        errors.avatarUrl = 'Masukkan URL gambar yang valid (mis. https://…).';
      }
      break;
    }
    case 'about': {
      if (isBlank(section.content.body)) {
        errors.body = 'Tulis sedikit tentang dirimu, atau sembunyikan bagian ini.';
      }
      break;
    }
    case 'experience': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.role)) {
          errors[`items.${i}.role`] = 'Peran/jabatan wajib diisi.';
        }
        if (isBlank(item.organization)) {
          errors[`items.${i}.organization`] = 'Nama perusahaan/organisasi wajib diisi.';
        }
        if (isBlank(item.startDate)) {
          errors[`items.${i}.startDate`] = 'Tanggal mulai wajib diisi.';
        }
        if (!item.isCurrent && isBlank(item.endDate)) {
          errors[`items.${i}.endDate`] =
            'Isi tanggal selesai, atau tandai "Masih bekerja di sini".';
        }
      });
      break;
    }
    case 'education': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.institution)) {
          errors[`items.${i}.institution`] = 'Nama institusi wajib diisi.';
        }
        if (isBlank(item.qualification)) {
          errors[`items.${i}.qualification`] = 'Gelar/kualifikasi wajib diisi.';
        }
      });
      break;
    }
    case 'skills': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.name)) {
          errors[`items.${i}.name`] = 'Nama keahlian wajib diisi.';
        }
      });
      break;
    }
    case 'projects': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.name)) {
          errors[`items.${i}.name`] = 'Nama project wajib diisi.';
        }
        if (!isBlank(item.url) && !URL_RE.test(item.url!.trim())) {
          errors[`items.${i}.url`] = 'Masukkan URL yang valid (mis. https://…).';
        }
      });
      break;
    }
    case 'services': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.name)) {
          errors[`items.${i}.name`] = 'Nama layanan wajib diisi.';
        }
      });
      break;
    }
    case 'certifications': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.name)) {
          errors[`items.${i}.name`] = 'Nama sertifikat wajib diisi.';
        }
        if (isBlank(item.issuer)) {
          errors[`items.${i}.issuer`] = 'Penerbit sertifikat wajib diisi.';
        }
        if (
          !isBlank(item.credentialUrl) &&
          !URL_RE.test(item.credentialUrl!.trim())
        ) {
          errors[`items.${i}.credentialUrl`] =
            'Masukkan URL kredensial yang valid.';
        }
      });
      break;
    }
    case 'awards': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.title)) {
          errors[`items.${i}.title`] = 'Judul penghargaan wajib diisi.';
        }
      });
      break;
    }
    case 'testimonials': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.quote)) {
          errors[`items.${i}.quote`] = 'Isi testimoni wajib diisi.';
        }
        if (isBlank(item.author)) {
          errors[`items.${i}.author`] =
            'Nama pemberi testimoni wajib diisi (hanya testimoni nyata).';
        }
      });
      break;
    }
    case 'contact': {
      const c = section.content;
      if (!isBlank(c.email) && !EMAIL_RE.test(c.email!.trim())) {
        errors.email = 'Masukkan alamat email yang valid.';
      }
      break;
    }
    case 'socialLinks': {
      section.content.items.forEach((item, i) => {
        if (isBlank(item.label)) {
          errors[`items.${i}.label`] = 'Label tautan wajib diisi.';
        }
        if (isBlank(item.url)) {
          errors[`items.${i}.url`] = 'URL wajib diisi.';
        } else if (!URL_RE.test(item.url.trim())) {
          errors[`items.${i}.url`] = 'Masukkan URL yang valid (mis. https://…).';
        }
      });
      break;
    }
    default:
      break;
  }

  return errors;
}
