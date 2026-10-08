import { Textarea } from '../../../components/Textarea';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** About section form: a single longer narrative body. */
export function AboutForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'about'>>) {
  const c = section.content;
  return (
    <div className={styles.form}>
      <Textarea
        label="Tentang kamu"
        rows={6}
        value={c.body}
        onChange={(e) => onChange({ ...section, content: { body: e.target.value } })}
        placeholder="Contoh: Saya membantu tim membangun produk yang jelas dan mudah dipakai."
        error={errors.body}
      />
    </div>
  );
}

export default AboutForm;
