import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import { Checkbox } from '../../../components/Checkbox';
import type { Experience } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/**
 * Experience section form (spec 8.2): company, role, start date, end date OR a
 * "current" toggle, optional location, description, achievements, and
 * technologies/skills. Toggling "current" hides and clears the end date.
 */
export function ExperienceForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'experience'>>) {
  const items = section.content.items;
  const update = (next: Experience[]) =>
    onChange({ ...section, content: { items: next } });

  const patchItem = (index: number, patch: Partial<Experience>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Experience>
        items={items}
        onChange={update}
        makeItem={() => ({
          id: createId(),
          role: '',
          organization: '',
          startDate: '',
        })}
        itemNoun="pengalaman"
        itemTitle={(i) => `Pengalaman ${i + 1}`}
        addLabel="Tambah pengalaman"
        emptyHint="Belum ada pengalaman. Tambahkan satu peran untuk mulai."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Peran / jabatan"
                required
                value={item.role}
                onChange={(e) => patchItem(index, { role: e.target.value })}
                placeholder="Contoh: Senior Product Designer"
                error={errors[`items.${index}.role`]}
              />
              <Input
                label="Perusahaan / organisasi"
                required
                value={item.organization}
                onChange={(e) =>
                  patchItem(index, { organization: e.target.value })
                }
                placeholder="Contoh: Tokopedia"
                error={errors[`items.${index}.organization`]}
              />
            </div>
            <div className={styles.row}>
              <Input
                type="month"
                label="Tanggal mulai"
                required
                value={item.startDate}
                onChange={(e) =>
                  patchItem(index, { startDate: e.target.value })
                }
                error={errors[`items.${index}.startDate`]}
              />
              <Input
                type="month"
                label="Tanggal selesai"
                value={item.endDate ?? ''}
                disabled={item.isCurrent}
                onChange={(e) => patchItem(index, { endDate: e.target.value })}
                error={errors[`items.${index}.endDate`]}
              />
            </div>
            <Checkbox
              label="Masih bekerja di sini"
              checked={Boolean(item.isCurrent)}
              onChange={(e) =>
                patchItem(index, {
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? undefined : item.endDate,
                })
              }
            />
            <Input
              label="Lokasi (opsional)"
              value={item.location ?? ''}
              onChange={(e) => patchItem(index, { location: e.target.value })}
              placeholder="Contoh: Jakarta (remote)"
            />
            <Textarea
              label="Deskripsi"
              rows={3}
              value={item.description ?? ''}
              onChange={(e) =>
                patchItem(index, { description: e.target.value })
              }
              placeholder="Contoh: Memimpin desain untuk alur checkout."
            />
            <Textarea
              label="Pencapaian (opsional)"
              hint="Satu pencapaian per baris."
              rows={3}
              value={(item.highlights ?? []).join('\n')}
              onChange={(e) =>
                patchItem(index, {
                  highlights: splitLines(e.target.value),
                })
              }
              placeholder={'Contoh: Menurunkan waktu checkout 20%'}
            />
            <Input
              label="Teknologi / keahlian (opsional)"
              hint="Pisahkan dengan koma."
              value={(item.technologies ?? []).join(', ')}
              onChange={(e) =>
                patchItem(index, {
                  technologies: splitList(e.target.value),
                })
              }
              placeholder="Contoh: Figma, React, Design Systems"
            />
          </div>
        )}
      />
    </div>
  );
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export default ExperienceForm;
