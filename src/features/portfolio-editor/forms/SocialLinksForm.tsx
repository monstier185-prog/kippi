import { Input } from '../../../components/Input';
import type { SocialLink } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Social links section form. Each link needs a label and a valid URL. */
export function SocialLinksForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'socialLinks'>>) {
  const items = section.content.items;
  const update = (next: SocialLink[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<SocialLink>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<SocialLink>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), label: '', url: '' })}
        itemNoun="tautan"
        itemTitle={(i) => `Tautan ${i + 1}`}
        addLabel="Tambah tautan"
        emptyHint="Belum ada tautan sosial."
        renderItem={(item, index) => (
          <div className={styles.row}>
            <Input
              label="Label"
              required
              value={item.label}
              onChange={(e) => patchItem(index, { label: e.target.value })}
              placeholder="Contoh: LinkedIn"
              error={errors[`items.${index}.label`]}
            />
            <Input
              label="URL"
              required
              value={item.url}
              onChange={(e) => patchItem(index, { url: e.target.value })}
              placeholder="Contoh: https://linkedin.com/in/…"
              error={errors[`items.${index}.url`]}
            />
          </div>
        )}
      />
    </div>
  );
}

export default SocialLinksForm;
