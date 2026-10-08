/**
 * Image upload validation (spec Section 11.1 / Sesi 9).
 *
 * Local-first: images are read in the browser and stored as base64 data URLs in
 * localStorage (there is no upload server). Even so, we validate every chosen
 * file by:
 *   1. MIME type (the browser-reported `File.type`),
 *   2. file extension,
 *   3. size ceiling,
 *   4. magic bytes (file signature) where feasible — this is the strongest
 *      check because MIME + extension are both attacker-controllable.
 *
 * An image must additionally carry alt text when displayed; the renderer always
 * supplies alt text derived from the owner's name, so decorative-only images
 * never ship without a text alternative.
 */

/** Allowed image MIME types. */
export const ALLOWED_IMAGE_MIME = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/avif',
] as const;

/** Allowed file extensions (lower-case, no dot). */
export const ALLOWED_IMAGE_EXT = [
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'avif',
] as const;

/** Maximum accepted file size in bytes (2 MB). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export interface ImageValidationOk {
  ok: true;
}

export interface ImageValidationError {
  ok: false;
  /** Actionable, user-facing reason (Indonesian), safe to show inline. */
  message: string;
  /** Machine-readable reason for tests / logging (never the file content). */
  code: 'mime' | 'extension' | 'size' | 'empty' | 'signature';
}

export type ImageValidationResult = ImageValidationOk | ImageValidationError;

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

/**
 * Validate a file's declared MIME, extension, and size. This does NOT read the
 * bytes; call `verifyImageSignature` for the magic-byte check once the bytes
 * are available (it needs an async read).
 */
export function validateImageFile(file: {
  name: string;
  type: string;
  size: number;
}): ImageValidationResult {
  if (file.size <= 0) {
    return { ok: false, code: 'empty', message: 'File gambar kosong. Pilih file lain.' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      code: 'size',
      message: `Ukuran gambar maksimal ${mb} MB. Kompres gambar lalu coba lagi.`,
    };
  }
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      code: 'mime',
      message: 'Format gambar tidak didukung. Gunakan PNG, JPG, GIF, WebP, atau AVIF.',
    };
  }
  const ext = extensionOf(file.name);
  if (!(ALLOWED_IMAGE_EXT as readonly string[]).includes(ext)) {
    return {
      ok: false,
      code: 'extension',
      message: 'Ekstensi file tidak dikenali. Gunakan .png, .jpg, .gif, .webp, atau .avif.',
    };
  }
  return { ok: true };
}

/** Known image file signatures (magic bytes), keyed by a short label. */
const SIGNATURES: Array<{ label: string; bytes: number[]; offset?: number }> = [
  { label: 'png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { label: 'jpeg', bytes: [0xff, 0xd8, 0xff] },
  { label: 'gif', bytes: [0x47, 0x49, 0x46, 0x38] },
  // RIFF....WEBP — check 'RIFF' at 0 and 'WEBP' at 8.
  { label: 'webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

function matches(view: Uint8Array, bytes: number[], offset = 0): boolean {
  if (view.length < offset + bytes.length) return false;
  return bytes.every((b, i) => view[offset + i] === b);
}

/**
 * Verify the leading bytes of a file against known image signatures. Returns
 * `true` when the content looks like a real image, so a renamed `.exe` with an
 * `image/png` MIME is still rejected. AVIF (ISO-BMFF) is accepted if the
 * `ftyp` box is present, otherwise we fall back to trusting the earlier
 * MIME/extension checks for formats without a simple signature.
 */
export function verifyImageSignature(bytes: Uint8Array): boolean {
  for (const sig of SIGNATURES) {
    if (matches(bytes, sig.bytes, sig.offset)) {
      if (sig.label === 'webp') {
        return matches(bytes, [0x57, 0x45, 0x42, 0x50], 8); // 'WEBP' at offset 8
      }
      return true;
    }
  }
  // AVIF / HEIF: ISO base media format, 'ftyp' box at offset 4.
  if (matches(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return true;
  return false;
}
