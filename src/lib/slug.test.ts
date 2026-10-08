import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from './slug';

describe('slugify', () => {
  it('lowercases, hyphenates, and strips unsafe characters', () => {
    expect(slugify('Senior Engineer!')).toBe('senior-engineer');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
    expect(slugify('Café São Paulo')).toBe('cafe-sao-paulo');
  });

  it('collapses separator runs and trims edges', () => {
    expect(slugify('--a--b--')).toBe('a-b');
  });

  it('falls back to "portfolio" for empty results', () => {
    expect(slugify('   ')).toBe('portfolio');
    expect(slugify('!!!')).toBe('portfolio');
  });

  it('produces only URL-safe characters', () => {
    expect(slugify('Hello, World 2024')).toMatch(/^[a-z0-9-]+$/);
  });
});

describe('uniqueSlug', () => {
  it('returns the base slug when free', () => {
    expect(uniqueSlug('My CV', [])).toBe('my-cv');
  });

  it('appends an incrementing suffix on collision', () => {
    const taken = ['my-cv'];
    expect(uniqueSlug('My CV', taken)).toBe('my-cv-2');
    expect(uniqueSlug('My CV', ['my-cv', 'my-cv-2'])).toBe('my-cv-3');
  });
});
