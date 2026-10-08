import { Input } from '../../../components/Input';
import type { Certification } from '../../../models';
import { createId } from '../../../lib/id';
import { RepeatableList } from './RepeatableList';
import type { SectionFormProps, SectionOfType } from './formTypes';
import styles from './forms.module.css';

/** Certifications section form. Name and issuer are required. */
export function CertificationsForm({
  section,
  onChange,
  errors,
}: SectionFormProps<SectionOfType<'certifications'>>) {
  const items = section.content.items;
  const update = (next: Certification[]) =>
    onChange({ ...section, content: { items: next } });
  const patchItem = (index: number, patch: Partial<Certification>) =>
    update(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  return (
    <div className={styles.form}>
      <RepeatableList<Certification>
        items={items}
        onChange={update}
        makeItem={() => ({ id: createId(), name: '', issuer: '' })}
        itemNoun="sertifikat"
        itemTitle={(i) => `Sertifikat ${i + 1}`}
        addLabel="Tambah sertifikat"
        emptyHint="Belum ada sertifikat."
        renderItem={(item, index) => (
          <div className={styles.form}>
            <div className={styles.row}>
              <Input
                label="Nama sertifikat"
                required
                value={item.name}
                onChange={(e) => patchItem(index, { name: e.target.value })}
                placeholder="Contoh: AWS Certified Developer"
                error={errors[`items.${index}.name`]}
              />
              <Input
                label="Penerbit"
                required
                value={item.issuer}
                onChange={(e) => patchItem(index, { issuer: e.target.value })}
                placeholder="Contoh: Amazon Web Services"
                error={errors[`items.${index}.issuer`]}
              />
            </div>
            <div className={styles.row}>
              <Input
                type="month"
                label="Tanggal terbit (opsional)"
                value={item.issueDate ?? ''}
                onChange={(e) =>
                  patchItem(index, { issueDate: e.target.value })
                }
              />
              <Input
                label="URL kredensial (opsional)"
                value={item.credentialUrl ?? ''}
                onChange={(e) =>
                  patchItem(index, { credentialUrl: e.target.value })
                }
                placeholder="Contoh: https://…/verify"
                error={errors[`items.${index}.credentialUrl`]}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default CertificationsForm;
