/**
 * PublishDialog — explicit publish / unpublish control with honest Privacy UX
 * (spec Section 11.2). Nothing becomes public without the user clicking the
 * confirm button here. The copy answers, plainly:
 *   - what status the portfolio is in now,
 *   - who can see it (only this browser, because there is no server),
 *   - what publishing does,
 *   - how to disable the public link,
 *   - where the data is stored.
 * It never claims a live hosted URL exists.
 */
import { useState } from 'react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import type { Portfolio } from '../../models';
import { publicUrl } from './publishModel';
import styles from './PublishDialog.module.css';

export interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  /** Publish in this browser (explicit action). */
  onPublish: () => Promise<void> | void;
  /** Disable the local public link. */
  onUnpublish: () => Promise<void> | void;
}

export function PublishDialog({
  open,
  onClose,
  portfolio,
  onPublish,
  onUnpublish,
}: PublishDialogProps) {
  const [busy, setBusy] = useState(false);
  const published = portfolio.status === 'published';
  const url = publicUrl(portfolio.slug);

  const run = async (action: () => Promise<void> | void) => {
    setBusy(true);
    try {
      await action();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={published ? 'Portfolio ini sudah dipublikasikan' : 'Publikasikan portfolio?'}
      description={
        published
          ? 'Tautan publik lokal aktif di browser ini. Kamu bisa menonaktifkannya kapan saja.'
          : 'Baca dulu apa yang terjadi saat kamu mempublikasikan. Tidak ada yang menjadi publik sampai kamu menekan tombol konfirmasi.'
      }
      footer={
        published ? (
          <>
            <Button onClick={onClose} disabled={busy}>
              Tutup
            </Button>
            <Button
              variant="danger"
              loading={busy}
              onClick={() => void run(onUnpublish)}
            >
              Nonaktifkan tautan publik
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={busy}>
              Batal
            </Button>
            <Button
              variant="primary"
              loading={busy}
              onClick={() => void run(onPublish)}
            >
              Ya, publikasikan di browser ini
            </Button>
          </>
        )
      }
    >
      <div className={styles.body}>
        <dl className={styles.facts}>
          <div className={styles.row}>
            <dt>Status saat ini</dt>
            <dd>
              {published
                ? 'Published — bisa dilihat lewat tautan lokal di browser ini.'
                : portfolio.status === 'draft'
                  ? 'Draft — belum bisa dilihat lewat tautan publik.'
                  : 'Private — belum bisa dilihat lewat tautan publik.'}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Siapa yang bisa melihat</dt>
            <dd>
              Hanya orang yang membuka tautan di <strong>browser ini</strong>.
              MyStreet.id tidak punya server, jadi tautan tidak bisa dibuka dari
              perangkat atau browser lain.
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Apa yang terjadi saat publikasi</dt>
            <dd>
              Status portfolio berubah menjadi <em>published</em> sehingga
              halaman <code>{`/p/${portfolio.slug}`}</code> menampilkan isinya.
              Tidak ada data yang diunggah ke mana pun.
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Menonaktifkan tautan</dt>
            <dd>
              Buka dialog ini lagi lalu pilih “Nonaktifkan tautan publik”.
              Portfolio kembali privat dan <code>/p/{portfolio.slug}</code> tidak
              lagi menampilkannya.
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Aset &amp; gambar</dt>
            <dd>
              Gambar disimpan sebagai bagian dari data lokal (URL atau data
              gambar), bukan di penyimpanan publik. Siapa pun yang membuka
              halaman publik di browser ini akan melihat gambar yang tampil.
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Penyimpanan data</dt>
            <dd>
              Semua data disimpan di <strong>penyimpanan lokal browser ini</strong>,
              bukan di server. Untuk benar-benar membagikan, gunakan ekspor
              (Print / PDF).
            </dd>
          </div>
        </dl>

        {published ? (
          <p className={styles.urlNote}>
            Tautan lokal: <code className={styles.url}>{url}</code>
            <br />
            <span className={styles.muted}>
              Tautan ini hanya berfungsi di browser ini — bukan URL hosting.
            </span>
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

export default PublishDialog;
