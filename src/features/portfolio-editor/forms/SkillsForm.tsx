import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import type { Skill } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

const LEVELS = [
  { value: '', label: '—' },
  { value: 'beginner', label: 'Pemula' },
  { value: 'intermediate', label: 'Menengah' },
  { value: 'advanced', label: 'Mahir' },
  { value: 'expert', label: 'Ahli' },
];

/** Skills section form. Each skill needs a name; level and group are optional. */
export function SkillsForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'skills'>>) {
  const items = section.content.items;
  const update = (next: Skill[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Skill>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Skill>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), name: '' })}
        itemNoun="keahlian"
        itemTitle={(i) => `Keahlian ${i + 1}`}
        addLabel="Tambah keahlian"
        emptyHint="Belum ada keahlian."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <Input
              label="Nama keahlian"
              required
              value={item.name}
              onChange={(e) => patchItem(index, { name: e.target.value })}
              placeholder="Contoh: Riset pengguna"
              error={errors[`items.${index}.name`]}
            />
            <div className={styles.row}>
              <Select
                label="Tingkat (opsional)"
                options={LEVELS}
                value={item.level ?? ''}
                onChange={(e) =>
                  patchItem(index, {
                    level: (e.target.value || undefined) as Skill['level'],
                  })
                }
              />
              <Input
                label="Kelompok (opsional)"
                value={item.group ?? ''}
                onChange={(e) => patchItem(index, { group: e.target.value })}
                placeholder="Contoh: Desain"
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default SkillsForm;
