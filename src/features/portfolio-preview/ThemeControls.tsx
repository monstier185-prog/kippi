/**
 * Theme & customization controls for the editor Settings pane (spec Sesi 6).
 *
 * Everything here edits the typed model: `templateId` on the Portfolio and the
 * `ThemeConfig` (accent, typography, spacing density, profile-image behavior),
 * plus per-section visibility toggles. All choices come from constrained,
 * contrast-safe option sets in `theme.ts`, so no selection can break contrast.
 * A "Reset ke bawaan" action restores the sensible defaults.
 *
 * This component only emits change callbacks; it holds no persistence logic, so
 * the editor's existing autosave handles saving.
 */
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Toggle } from '../../components/Toggle';
import type {
  AccentId,
  PortfolioSection,
  ProfileImageShape,
  SpacingDensity,
  TemplateId,
  ThemeConfig,
  TypographyPairingId,
} from '../../models';
import { SECTION_TITLE } from './sectionView';
import {
  ACCENTS,
  PROFILE_IMAGE_SHAPES,
  resolveTheme,
  SPACING_DENSITIES,
  TEMPLATES,
  TYPOGRAPHY_PAIRINGS,
} from './theme';
import styles from './ThemeControls.module.css';

export interface ThemeControlsProps {
  templateId: string;
  theme: ThemeConfig;
  sections: PortfolioSection[];
  onTemplateChange: (templateId: TemplateId) => void;
  onThemeChange: (theme: ThemeConfig) => void;
  onToggleSection: (sectionId: string) => void;
  onReset: () => void;
}

export function ThemeControls({
  templateId,
  theme,
  sections,
  onTemplateChange,
  onThemeChange,
  onToggleSection,
  onReset,
}: ThemeControlsProps) {
  const resolved = resolveTheme(theme, templateId);
  const orderedSections = [...sections].sort((a, b) => a.position - b.position);

  const patch = (next: Partial<ThemeConfig>) => {
    onThemeChange({ ...theme, ...next });
  };

  return (
    <section className={styles.pane} aria-label="Tema dan tampilan">
      {/* Template — structural, not just color. */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Template</legend>
        <p className={styles.hint}>
          Tiga template dengan struktur berbeda. Mengganti template tidak
          mengubah datamu.
        </p>
        <div className={styles.templateList} role="radiogroup" aria-label="Template">
          {TEMPLATES.map((t) => {
            const active = resolved.templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={`${styles.templateCard} ${active ? styles.templateActive : ''}`}
                onClick={() => onTemplateChange(t.id)}
              >
                <span className={styles.templateName}>{t.label}</span>
                <span className={styles.templateDesc}>{t.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Accent — constrained, contrast-safe palette. */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Warna aksen</legend>
        <p className={styles.hint}>
          Palet terbatas yang sudah dijaga kontrasnya agar teks tetap terbaca.
        </p>
        <div className={styles.swatches} role="radiogroup" aria-label="Warna aksen">
          {ACCENTS.map((a) => {
            const active = resolved.accent.id === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={a.label}
                title={a.label}
                className={`${styles.swatch} ${active ? styles.swatchActive : ''}`}
                style={{ backgroundColor: a.value }}
                onClick={() => patch({ accent: a.id as AccentId })}
              >
                {active ? (
                  <span aria-hidden="true" style={{ color: a.onAccent }}>
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Select
        label="Pasangan tipografi"
        value={resolved.typography.id}
        options={TYPOGRAPHY_PAIRINGS.map((t) => ({
          value: t.id,
          label: t.label,
        }))}
        onChange={(e) =>
          patch({ typography: e.target.value as TypographyPairingId })
        }
      />

      <Select
        label="Kerapatan jarak"
        value={resolved.spacing.id}
        options={SPACING_DENSITIES.map((s) => ({
          value: s.id,
          label: s.label,
        }))}
        onChange={(e) =>
          patch({ spacingDensity: e.target.value as SpacingDensity })
        }
      />

      {/* Profile image behavior — photo stays optional. */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Foto profil</legend>
        <Toggle
          label="Tampilkan foto profil bila ada"
          checked={resolved.profileImage.show}
          onChange={(e) =>
            patch({
              profileImage: {
                show: e.target.checked,
                shape: resolved.profileImage.shape.id,
              },
            })
          }
        />
        <Select
          label="Bentuk foto"
          value={resolved.profileImage.shape.id}
          disabled={!resolved.profileImage.show}
          options={PROFILE_IMAGE_SHAPES.map((s) => ({
            value: s.id,
            label: s.label,
          }))}
          onChange={(e) =>
            patch({
              profileImage: {
                show: resolved.profileImage.show,
                shape: e.target.value as ProfileImageShape,
              },
            })
          }
        />
      </fieldset>

      {/* Visible sections (layout option). */}
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Bagian yang tampil</legend>
        <p className={styles.hint}>
          Matikan bagian yang belum ingin kamu tampilkan di portfolio.
        </p>
        {orderedSections.length === 0 ? (
          <p className={styles.hint}>Belum ada bagian untuk diatur.</p>
        ) : (
          <ul className={styles.sectionList}>
            {orderedSections.map((s) => (
              <li key={s.id}>
                <Toggle
                  label={SECTION_TITLE[s.type]}
                  checked={s.isVisible}
                  onChange={() => onToggleSection(s.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className={styles.resetRow}>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset ke bawaan
        </Button>
      </div>
    </section>
  );
}

export default ThemeControls;
