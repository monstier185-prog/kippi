import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import type { Service } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Services / What I Do section form. Each service needs a name. */
export function ServicesForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'services'>>) {
  const items = section.content.items;
  const update = (next: Service[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Service>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Service>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), name: '' })}
        itemNoun="layanan"
        itemTitle={(i) => `Layanan ${i + 1}`}
        addLabel="Tambah layanan"
        emptyHint="Belum ada layanan."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <Input
              label="Nama layanan"
              required
              value={item.name}
              onChange={(e) => patchItem(index, { name: e.target.value })}
              placeholder="Contoh: Desain antarmuka produk"
              error={errors[`items.${index}.name`]}
            />
            <Textarea
              label="Deskripsi (opsional)"
              rows={2}
              value={item.description ?? ''}
              onChange={(e) =>
                patchItem(index, { description: e.target.value })
              }
              placeholder="Contoh: Dari riset sampai prototipe teruji."
            />
          </div>
        )}
      />
    </div>
  );
}

export default ServicesForm;
