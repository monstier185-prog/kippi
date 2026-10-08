import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import type { Education } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Education section form. Institution and qualification are required. */
export function EducationForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'education'>>) {
  const items = section.content.items;
  const update = (next: Education[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Education>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Education>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), institution: '', qualification: '' })}
        itemNoun="pendidikan"
        itemTitle={(i) => `Pendidikan ${i + 1}`}
        addLabel="Tambah pendidikan"
        emptyHint="Belum ada riwayat pendidikan."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Institusi"
                required
                value={item.institution}
                onChange={(e) =>
                  patchItem(index, { institution: e.target.value })
                }
                placeholder="Contoh: Universitas Indonesia"
                error={errors[`items.${index}.institution`]}
              />
              <Input
                label="Gelar / kualifikasi"
                required
                value={item.qualification}
                onChange={(e) =>
                  patchItem(index, { qualification: e.target.value })
                }
                placeholder="Contoh: S1 Ilmu Komputer"
                error={errors[`items.${index}.qualification`]}
              />
            </div>
            <Input
              label="Bidang studi (opsional)"
              value={item.fieldOfStudy ?? ''}
              onChange={(e) =>
                patchItem(index, { fieldOfStudy: e.target.value })
              }
              placeholder="Contoh: Rekayasa Perangkat Lunak"
            />
            <div className={styles.row}>
              <Input
                type="month"
                label="Mulai (opsional)"
                value={item.startDate ?? ''}
                onChange={(e) =>
                  patchItem(index, { startDate: e.target.value })
                }
              />
              <Input
                type="month"
                label="Selesai (opsional)"
                value={item.endDate ?? ''}
                onChange={(e) => patchItem(index, { endDate: e.target.value })}
              />
            </div>
            <Textarea
              label="Catatan (opsional)"
              rows={2}
              value={item.description ?? ''}
              onChange={(e) =>
                patchItem(index, { description: e.target.value })
              }
              placeholder="Contoh: Lulus dengan predikat cum laude."
            />
          </div>
        )}
      />
    </div>
  );
}

export default EducationForm;
