import { Input } from '../../../components/Input';
import { Textarea } from '../../../components/Textarea';
import type { Project } from '../../../models';
import { createId } from '../../../lib/id';
import { ImageField } from './ImageField';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/**
 * Projects section form (spec 8.3): project name, one-line summary, description,
 * role, year, tools, project URL, optional repository URL, optional cover
 * image, optional outcomes. Only the name is required.
 */
export function ProjectsForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'projects'>>) {
  const items = section.content.items;
  const update = (next: Project[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Project>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Project>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), name: '', tags: [] })}
        itemNoun="project"
        itemTitle={(i) => `Project ${i + 1}`}
        addLabel="Tambah project"
        emptyHint="Belum ada project. Tambahkan satu karya terbaikmu."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <Input
              label="Nama project"
              required
              value={item.name}
              onChange={(e) => patchItem(index, { name: e.target.value })}
              placeholder="Contoh: Aplikasi pelacak kebiasaan"
              error={errors[`items.${index}.name`]}
            />
            <Input
              label="Ringkasan satu baris"
              value={item.summary ?? ''}
              onChange={(e) => patchItem(index, { summary: e.target.value })}
              placeholder="Contoh: Aplikasi mobile untuk membangun kebiasaan harian."
            />
            <Textarea
              label="Deskripsi"
              rows={3}
              value={item.description ?? ''}
              onChange={(e) =>
                patchItem(index, { description: e.target.value })
              }
              placeholder="Contoh: Membangun fitur onboarding dan pengingat."
            />
            <div className={styles.row}>
              <Input
                label="Peran"
                value={item.role ?? ''}
                onChange={(e) => patchItem(index, { role: e.target.value })}
                placeholder="Contoh: Lead Developer"
              />
              <Input
                label="Tahun"
                value={item.year ?? ''}
                onChange={(e) => patchItem(index, { year: e.target.value })}
                placeholder="Contoh: 2024"
              />
            </div>
            <Input
              label="Tools / teknologi"
              hint="Pisahkan dengan koma."
              value={item.tags.join(', ')}
              onChange={(e) =>
                patchItem(index, { tags: splitList(e.target.value) })
              }
              placeholder="Contoh: React Native, Firebase"
            />
            <div className={styles.row}>
              <Input
                label="URL project"
                value={item.url ?? ''}
                onChange={(e) => patchItem(index, { url: e.target.value })}
                placeholder="Contoh: https://project.example.com"
                error={errors[`items.${index}.url`]}
              />
              <Input
                label="URL repositori (opsional)"
                value={item.repositoryUrl ?? ''}
                onChange={(e) =>
                  patchItem(index, { repositoryUrl: e.target.value })
                }
                placeholder="Contoh: https://github.com/…"
              />
            </div>
            <ImageField
              label="Gambar sampul (opsional)"
              hint="Tempel URL atau unggah gambar."
              value={item.coverImageUrl}
              onChange={(coverImageUrl) =>
                patchItem(index, { coverImageUrl })
              }
              placeholder="Contoh: https://…/cover.jpg"
            />
            <Textarea
              label="Hasil / dampak (opsional)"
              rows={2}
              value={item.outcomes ?? ''}
              onChange={(e) => patchItem(index, { outcomes: e.target.value })}
              placeholder="Contoh: 5.000 pengguna aktif dalam 3 bulan."
            />
          </div>
        )}
      />
    </div>
  );
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export default ProjectsForm;
