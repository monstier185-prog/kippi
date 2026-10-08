import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import { ImageField } from './ImageField';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/**
 * Profile section form (spec 8.1). Full name is the only required field; the
 * professional title, bio, location, email, and profile image are optional —
 * a photo is NOT required. Placeholders are examples only, marked "Contoh:" and
 * never written to the model.
 */
export function ProfileForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'profile'>>) {
  const c = section.content;
  const set = (patch: Partial<typeof c>) =>
    onChange({ ...section, content: { ...c, ...patch } });

  return (
    <div className={styles.form}>
      <Input
        label="Nama lengkap"
        required
        value={c.fullName}
        onChange={(e) => set({ fullName: e.target.value })}
        placeholder="Contoh: Dewi Lestari"
        error={errors.fullName}
      />
      <Input
        label="Titel profesional"
        value={c.headline ?? ''}
        onChange={(e) => set({ headline: e.target.value })}
        placeholder="Contoh: Product Designer"
      />
      <Textarea
        label="Bio singkat"
        rows={3}
        value={c.summary ?? ''}
        onChange={(e) => set({ summary: e.target.value })}
        placeholder="Contoh: Desainer produk dengan fokus pada riset dan sistem desain."
      />
      <div className={styles.row}>
        <Input
          label="Lokasi (opsional)"
          value={c.location ?? ''}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="Contoh: Jakarta, Indonesia"
        />
        <ImageField
          label="Foto profil (opsional)"
          hint="Tempel URL atau unggah gambar. Foto tidak wajib."
          value={c.avatarUrl}
          onChange={(avatarUrl) => set({ avatarUrl })}
          placeholder="Contoh: https://…/foto.jpg"
          urlError={errors.avatarUrl}
        />
      </div>
    </div>
  );
}

export default ProfileForm;
