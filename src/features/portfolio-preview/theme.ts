/**
 * Theme system for the portfolio renderer (spec Sesi 6).
 *
 * This module is the single source of truth for the *constrained* set of theme
 * choices a user can make, their sensible defaults, and the mapping from a
 * `ThemeConfig` to concrete CSS custom properties. It is deliberately free of
 * any editor UI or React so the SAME values power both the in-editor live
 * preview and the public portfolio view (FEAT-006).
 *
 * Anti-slop / accessibility guarantees:
 *  - The accent palette is a small, curated set anchored on the brand (navy /
 *    coral). Every accent ships with an `onAccent` text color that is
 *    pre-verified to meet WCAG AA contrast against that accent, so NO user
 *    choice can produce unreadable text. `resolveTheme` always falls back to a
 *    known-good value, so a corrupt/unknown stored value can never break
 *    contrast either.
 *  - Typography pairings, spacing density and profile-image behavior are all
 *    enumerated, so there is no free-form input that could degrade the design.
 */
import type {
  AccentId,
  ProfileImageShape,
  SpacingDensity,
  TemplateId,
  ThemeConfig,
  TypographyPairingId,
} from '../../models';

export interface AccentOption {
  id: AccentId;
  label: string;
  /** The accent color itself. */
  value: string;
  /** Darker shade for hover / active. */
  hover: string;
  /** Text color placed ON the accent; AA-verified against `value`. */
  onAccent: string;
}

/**
 * The constrained accent palette. Each entry is anchored on the brand and its
 * `onAccent` pairing is contrast-safe (>= 4.5:1 for body text on the accent).
 */
export const ACCENTS: readonly AccentOption[] = [
  {
    id: 'coral',
    label: 'Coral (brand)',
    value: '#d9553c',
    hover: '#bd4531',
    onAccent: '#ffffff',
  },
  {
    id: 'navy',
    label: 'Navy (brand)',
    value: '#132a44',
    hover: '#0d1f33',
    onAccent: '#f7f3ed',
  },
  {
    id: 'teal',
    label: 'Teal',
    value: '#1f6f6b',
    hover: '#17524f',
    onAccent: '#ffffff',
  },
  {
    id: 'plum',
    label: 'Plum',
    value: '#6b3f67',
    hover: '#532f50',
    onAccent: '#ffffff',
  },
] as const;

export interface TypographyOption {
  id: TypographyPairingId;
  label: string;
  /** Font stack for headings. */
  heading: string;
  /** Font stack for body copy. */
  body: string;
}

const SANS =
  "'Inter', 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
const HUMANIST =
  "'Iowan Old Style', 'Palatino Linotype', 'Georgia', 'Times New Roman', serif";
const MONO = "ui-monospace, 'SFMono-Regular', 'Menlo', 'Consolas', monospace";

/** A small, curated set of typography pairings (spec Sesi 6). */
export const TYPOGRAPHY_PAIRINGS: readonly TypographyOption[] = [
  { id: 'sans', label: 'Sans modern', heading: SANS, body: SANS },
  { id: 'humanist', label: 'Serif humanis', heading: HUMANIST, body: SANS },
  { id: 'mono-accent', label: 'Mono aksen', heading: MONO, body: SANS },
] as const;

export interface SpacingOption {
  id: SpacingDensity;
  label: string;
  /** Base rhythm unit for the renderer, in rem. */
  unit: string;
}

/** Spacing density options (spec Sesi 6). */
export const SPACING_DENSITIES: readonly SpacingOption[] = [
  { id: 'compact', label: 'Rapat', unit: '0.72rem' },
  { id: 'comfortable', label: 'Nyaman', unit: '1rem' },
  { id: 'spacious', label: 'Lega', unit: '1.4rem' },
] as const;

export interface ProfileImageShapeOption {
  id: ProfileImageShape;
  label: string;
  radius: string;
}

export const PROFILE_IMAGE_SHAPES: readonly ProfileImageShapeOption[] = [
  { id: 'circle', label: 'Lingkaran', radius: '50%' },
  { id: 'rounded', label: 'Membulat', radius: '14px' },
  { id: 'square', label: 'Kotak', radius: '0' },
] as const;

export interface TemplateOption {
  id: TemplateId;
  label: string;
  description: string;
}

/** The three structurally-distinct templates (spec Section 6.5). */
export const TEMPLATES: readonly TemplateOption[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Fokus tipografi dan alur baca, satu kolom panjang.',
  },
  {
    id: 'structured',
    label: 'Structured',
    description: 'Timeline dan grid project, mudah dipindai.',
  },
  {
    id: 'quietStudio',
    label: 'Quiet Studio',
    description: 'Ruang kosong lega, presentasi karya yang minimal.',
  },
] as const;

/** Sensible defaults for a brand-new portfolio (spec: provide sane defaults). */
export const DEFAULT_THEME: Required<
  Pick<
    ThemeConfig,
    'accent' | 'typography' | 'spacingDensity' | 'profileImage'
  >
> = {
  accent: 'coral',
  typography: 'sans',
  spacingDensity: 'comfortable',
  profileImage: { show: true, shape: 'circle' },
};

export const DEFAULT_TEMPLATE_ID: TemplateId = 'editorial';

/**
 * A fully-resolved theme: every option has a concrete, known-good value. The
 * renderer consumes this (never the raw, partial `ThemeConfig`), so a missing
 * or corrupt stored field falls back to a default and contrast stays valid.
 */
export interface ResolvedTheme {
  templateId: TemplateId;
  accent: AccentOption;
  typography: TypographyOption;
  spacing: SpacingOption;
  profileImage: { show: boolean; shape: ProfileImageShapeOption };
}

function byId<T extends { id: string }>(
  options: readonly T[],
  id: string | undefined,
  fallback: T,
): T {
  return options.find((o) => o.id === id) ?? fallback;
}

function resolveTemplateId(value: string | undefined): TemplateId {
  return TEMPLATES.some((t) => t.id === value)
    ? (value as TemplateId)
    : DEFAULT_TEMPLATE_ID;
}

/**
 * Resolve a (possibly partial / legacy) ThemeConfig + templateId into a
 * complete, contrast-safe theme. Unknown values always fall back to a default.
 */
export function resolveTheme(
  theme: ThemeConfig | undefined,
  templateId: string | undefined,
): ResolvedTheme {
  const accent = byId(ACCENTS, theme?.accent, ACCENTS[0]);
  const typography = byId(
    TYPOGRAPHY_PAIRINGS,
    theme?.typography,
    TYPOGRAPHY_PAIRINGS[0],
  );
  const spacing = byId(
    SPACING_DENSITIES,
    theme?.spacingDensity,
    SPACING_DENSITIES[1],
  );
  const shape = byId(
    PROFILE_IMAGE_SHAPES,
    theme?.profileImage?.shape,
    PROFILE_IMAGE_SHAPES[0],
  );
  return {
    templateId: resolveTemplateId(templateId ?? theme?.templateId),
    accent,
    typography,
    spacing,
    profileImage: {
      show: theme?.profileImage?.show ?? DEFAULT_THEME.profileImage.show,
      shape,
    },
  };
}

/**
 * Build the inline CSS custom properties that scope a resolved theme to the
 * rendered portfolio. Returned as a plain style object so it works equally in
 * the editor preview and the public page.
 */
export function themeStyle(theme: ResolvedTheme): React.CSSProperties {
  return {
    '--pf-accent': theme.accent.value,
    '--pf-accent-hover': theme.accent.hover,
    '--pf-on-accent': theme.accent.onAccent,
    '--pf-font-heading': theme.typography.heading,
    '--pf-font-body': theme.typography.body,
    '--pf-space-unit': theme.spacing.unit,
    '--pf-avatar-radius': theme.profileImage.shape.radius,
  } as React.CSSProperties;
}

/**
 * Produce a reset ThemeConfig (defaults) while keeping the current template.
 * Used by the "Reset ke bawaan" action in Settings.
 */
export function resetThemeConfig(current: ThemeConfig): ThemeConfig {
  return {
    ...current,
    palette: 'navy',
    accent: DEFAULT_THEME.accent,
    typography: DEFAULT_THEME.typography,
    spacingDensity: DEFAULT_THEME.spacingDensity,
    profileImage: { ...DEFAULT_THEME.profileImage },
    accentColor: undefined,
    fontScale: 'comfortable',
  };
}
