import { describe, expect, it } from 'vitest';
import { safeImageUrl, safeMailto, safeUrl, toPlainText } from './sanitize';

describe('safeUrl', () => {
  it('allows http(s), mailto, tel, and relative URLs', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('http://example.com')).toBe('http://example.com');
    expect(safeUrl('mailto:a@b.com')).toBe('mailto:a@b.com');
    expect(safeUrl('/local/path')).toBe('/local/path');
  });

  it('rejects javascript:, vbscript:, data:, and file: schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('  javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('JavaScript:alert(1)')).toBeUndefined();
    expect(safeUrl('vbscript:msgbox(1)')).toBeUndefined();
    expect(safeUrl('data:text/html,<script>')).toBeUndefined();
    expect(safeUrl('file:///etc/passwd')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(safeUrl('')).toBeUndefined();
    expect(safeUrl(undefined)).toBeUndefined();
    expect(safeUrl('   ')).toBeUndefined();
  });
});

describe('safeImageUrl', () => {
  it('allows http(s) and base64 image data URLs', () => {
    expect(safeImageUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    expect(safeImageUrl(dataUrl)).toBe(dataUrl);
  });

  it('rejects script and non-image data URLs', () => {
    expect(safeImageUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeImageUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeUndefined();
  });
});

describe('safeMailto', () => {
  it('builds a mailto href for a valid email, keeping @ and . readable', () => {
    expect(safeMailto('dewi@example.com')).toBe('mailto:dewi@example.com');
    expect(safeMailto('  dewi.lestari@sub.example.co.id  ')).toBe(
      'mailto:dewi.lestari@sub.example.co.id',
    );
  });

  it('rejects malformed addresses and mail-header injection attempts', () => {
    expect(safeMailto('not-an-email')).toBeUndefined();
    expect(safeMailto('a@b')).toBeUndefined();
    expect(safeMailto('a @b.com')).toBeUndefined();
    // No smuggling of extra mailto headers (cc/bcc/body) via `?`.
    expect(safeMailto('a@b.com?cc=evil@x.com')).toBeUndefined();
    expect(safeMailto('a@b.com\r\nbcc=evil@x.com')).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(safeMailto('')).toBeUndefined();
    expect(safeMailto(undefined)).toBeUndefined();
    expect(safeMailto(null)).toBeUndefined();
  });
});

describe('toPlainText', () => {
  it('collapses whitespace and strips control characters', () => {
    expect(toPlainText('  hello   world  ')).toBe('hello world');
    expect(toPlainText('line1\nline2\tend')).toBe('line1 line2 end');
    expect(toPlainText('bad\u0000char')).toBe('bad char');
  });

  it('returns an empty string for nullish input', () => {
    expect(toPlainText(undefined)).toBe('');
    expect(toPlainText(null)).toBe('');
  });
});
