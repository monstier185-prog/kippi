import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import type { Award } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Awards section form. Only the title is required. */
export function AwardsForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'awards'>>) {
  const items = section.content.items;
  const update = (next: Award[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Award>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Award>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), title: '' })}
        itemNoun="penghargaan"
        itemTitle={(i) => `Penghargaan ${i + 1}`}
        addLabel="Tambah penghargaan"
        emptyHint="Belum ada penghargaan."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Judul"
                required
                value={item.title}
                onChange={(e) => patchItem(index, { title: e.target.value })}
                placeholder="Contoh: Juara 1 Hackathon Nasional"
                error={errors[`items.${index}.title`]}
              />
              <Input
                label="Pemberi (opsional)"
                value={item.issuer ?? ''}
                onChange={(e) => patchItem(index, { issuer: e.target.value })}
                placeholder="Contoh: Kominfo"
              />
            </div>
            <Input
              type="month"
              label="Tanggal (opsional)"
              value={item.date ?? ''}
              onChange={(e) => patchItem(index, { date: e.target.value })}
            />
            <Textarea
              label="Deskripsi (opsional)"
              rows={2}
              value={item.description ?? ''}
              onChange={(e) =>
                patchItem(index, { description: e.target.value })
              }
              placeholder="Contoh: Dipilih dari 200 tim peserta."
            />
          </div>
        )}
      />
    </div>
  );
}

export default AwardsForm;
