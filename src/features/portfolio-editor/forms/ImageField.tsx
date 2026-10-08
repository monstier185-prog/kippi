/**
 * ImageField — an image input that accepts EITHER a pasted URL or a locally
 * chosen file (spec Section 11.1 image handling). Photos are always optional.
 *
 * A chosen file is validated before it is accepted:
 *   1. MIME type + extension + size (`validateImageFile`), then
 *   2. magic-byte signature (`verifyImageSignature`) on the actual bytes.
 * Only a file that passes every check is stored, as a base64 data URL, in the
 * portfolio's local data. Rejections surface an inline, actionable error that
 * is announced to assistive tech (role="alert"). Alt text is supplied by the
 * renderer from the owner's name, so an accepted image never ships without a
 * text alternative.
 */
import { useId, useRef, useState } from 'react';
import { Input } from '../../../components/Input';
import {
  MAX_IMAGE_BYTES,
  validateImageFile,
  verifyImageSignature,
} from '../../../lib/imageValidation';
import styles from './forms.module.css';

export interface ImageFieldProps {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  hint?: string;
  placeholder?: string;
  /** Error from URL-shape validation (e.g. zod), shown on the URL input. */
  urlError?: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

function readSignatureBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(new Uint8Array(reader.result as ArrayBuffer).slice(0, 16));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  urlError,
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const errorId = useId();

  const handleFile = async (file: File | undefined) => {
    setFileError(null);
    if (!file) return;
    const basic = validateImageFile(file);
    if (!basic.ok) {
      setFileError(basic.message);
      return;
    }
    try {
      const bytes = await readSignatureBytes(file);
      if (!verifyImageSignature(bytes)) {
        setFileError(
          'Isi file tidak cocok dengan format gambar. Pilih file gambar yang asli.',
        );
        return;
      }
      const dataUrl = await readAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      setFileError('Gambar gagal dibaca. Coba file lain.');
    } finally {
      // Allow re-selecting the same file after fixing it.
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const isDataUrl = value?.startsWith('data:') ?? false;

  return (
    <div className={styles.imageField}>
      <Input
        label={label}
        hint={hint}
        value={isDataUrl ? '' : (value ?? '')}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        error={urlError}
        disabled={isDataUrl}
      />
      <div className={styles.imageUpload}>
        <label className={styles.uploadLabel}>
          <span className={styles.uploadBtn}>Unggah gambar…</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
            className={styles.srOnlyInput}
            aria-describedby={fileError ? errorId : undefined}
            aria-invalid={fileError ? true : undefined}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
        <span className={styles.uploadHint}>
          Maks {Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} MB · PNG, JPG, GIF,
          WebP, AVIF
        </span>
        {isDataUrl ? (
          <button
            type="button"
            className={styles.uploadRemove}
            onClick={() => onChange(undefined)}
          >
            Hapus gambar
          </button>
        ) : null}
      </div>
      {fileError ? (
        <span id={errorId} className={styles.imageError} role="alert">
          {fileError}
        </span>
      ) : null}
    </div>
  );
}

export default ImageField;
