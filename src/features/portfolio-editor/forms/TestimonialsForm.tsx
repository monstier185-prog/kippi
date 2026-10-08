import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import type { Testimonial } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/**
 * Testimonials section form. Only user-entered testimonials are supported —
 * both the quote and a real author attribution are required so the app never
 * ships fabricated praise (anti-AI-slop rule).
 */
export function TestimonialsForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'testimonials'>>) {
  const items = section.content.items;
  const update = (next: Testimonial[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Testimonial>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <p className={styles.emptyHint}>
        Hanya tambahkan testimoni nyata dari orang yang benar-benar memberikannya.
      </p>
      <RepeatableList<Testimonial>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), quote: '', author: '' })}
        itemNoun="testimoni"
        itemTitle={(i) => `Testimoni ${i + 1}`}
        addLabel="Tambah testimoni"
        emptyHint="Belum ada testimoni."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <Textarea
              label="Kutipan"
              required
              rows={3}
              value={item.quote}
              onChange={(e) => patchItem(index, { quote: e.target.value })}
              placeholder="Contoh: Hasil kerjanya rapi dan tepat waktu."
              error={errors[`items.${index}.quote`]}
            />
            <div className={styles.row}>
              <Input
                label="Nama pemberi"
                required
                value={item.author}
                onChange={(e) => patchItem(index, { author: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                error={errors[`items.${index}.author`]}
              />
              <Input
                label="Peran / perusahaan (opsional)"
                value={item.authorRole ?? ''}
                onChange={(e) =>
                  patchItem(index, { authorRole: e.target.value })
                }
                placeholder="Contoh: Product Manager, Gojek"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default TestimonialsForm;
