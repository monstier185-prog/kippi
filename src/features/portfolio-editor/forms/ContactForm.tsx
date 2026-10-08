import { Input } from '../../../components/Input';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Contact section form. Every field is optional (private by default). */
export function ContactForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'contact'>>) {
  const c = section.content;
  const set = (patch: Partial<typeof c>) =>
    onChange({ ...section, content: { ...c, ...patch } });

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <Input
          type="email"
          label="Email (opsional)"
          value={c.email ?? ''}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="Contoh: nama@email.com"
          error={errors.email}
        />
        <Input
          label="Telepon (opsional)"
          value={c.phone ?? ''}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="Contoh: +62 812 3456 7890"
        />
      </div>
      <div className={styles.row}>
        <Input
          label="Lokasi (opsional)"
          value={c.location ?? ''}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="Contoh: Bandung, Indonesia"
        />
        <Input
          label="Ketersediaan (opsional)"
          value={c.availability ?? ''}
          onChange={(e) => set({ availability: e.target.value })}
          placeholder="Contoh: Terbuka untuk proyek lepas"
        />
      </div>
    </div>
  );
}

export default ContactForm;
