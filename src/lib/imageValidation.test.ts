import { describe, expect, it } from 'vitest';
import {
  MAX_IMAGE_BYTES,
  validateImageFile,
  verifyImageSignature,
} from './imageValidation';

describe('validateImageFile', () => {
  it('accepts a well-formed image file within size limits', () => {
    const result = validateImageFile({
      name: 'photo.png',
      type: 'image/png',
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a disallowed MIME type', () => {
    const result = validateImageFile({
      name: 'malware.svg',
      type: 'image/svg+xml',
      size: 1024,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('mime');
  });

  it('rejects a file whose extension is not allowed', () => {
    const result = validateImageFile({
      name: 'script.exe',
      type: 'image/png',
      size: 1024,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('extension');
  });

  it('rejects an oversize file with an actionable message', () => {
    const result = validateImageFile({
      name: 'huge.jpg',
      type: 'image/jpeg',
      size: MAX_IMAGE_BYTES + 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('size');
      expect(result.message).toMatch(/maksimal/i);
    }
  });

  it('rejects an empty file', () => {
    const result = validateImageFile({ name: 'x.png', type: 'image/png', size: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('empty');
  });
});

describe('verifyImageSignature', () => {
  it('accepts real PNG magic bytes', () => {
    expect(verifyImageSignature(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))).toBe(
      true,
    );
  });

  it('accepts real JPEG magic bytes', () => {
    expect(verifyImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      true,
    );
  });

  it('rejects a non-image payload masquerading as an image', () => {
    // "MZ" (a Windows executable) must never pass the signature check.
    expect(verifyImageSignature(new Uint8Array([0x4d, 0x5a, 0x90, 0x00]))).toBe(
      false,
    );
  });
});
