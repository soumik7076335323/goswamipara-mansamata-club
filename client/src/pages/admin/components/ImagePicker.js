import React, { useEffect, useRef, useState } from 'react';
import api from '../../../services/api';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useToast } from '../../../contexts/ToastContext';
import { Modal, Img, Spinner, Pagination } from '../../../components/ui';

export const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_MB = 5;

export async function uploadImages(files) {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append('files', f));
  const { data } = await api.post('/api/media/upload', fd);
  return data.items;
}

export async function uploadPdf(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/api/media/upload-pdf', fd);
  return data;
}

/** Modal media picker: library grid + upload new. */
export function MediaPickerModal({ open, onClose, onSelect, kind = 'image' }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const fileRef = useRef(null);

  const load = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/media', { params: { page, limit: 24, kind, q: q || undefined } });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [open, page, kind, q, toast]);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (kind === 'image') {
      const bad = list.find((f) => !IMAGE_MIMES.includes(f.type));
      if (bad) { toast.error(t('admin.media.invalid')); return; }
      const big = list.find((f) => f.size > MAX_IMAGE_MB * 1024 * 1024);
      if (big) { toast.error(t('admin.media.tooLarge')); return; }
    }
    setUploading(true);
    try {
      const created = kind === 'pdf' ? [await uploadPdf(list[0])] : await uploadImages(list);
      toast.success(t('common.saved'));
      if (created[0]) setSelected(created[0]);
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('admin.form.pickImage')} wide>
      <div className="filter-bar">
        <input className="input search-input" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('common.search') + '…'} aria-label={t('common.search')} />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => fileRef.current && fileRef.current.click()} disabled={uploading}>
          {uploading ? t('admin.form.uploading') : kind === 'pdf' ? t('admin.media.uploadPdf') : t('admin.media.upload')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={kind === 'pdf' ? 'application/pdf' : IMAGE_MIMES.join(',')}
          multiple={kind !== 'pdf'}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <div className="empty-state"><p>{t('common.empty.generic')}</p></div>
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <button
              type="button"
              key={m._id}
              className={`media-cell ${selected && selected._id === m._id ? 'selected' : ''}`}
              onClick={() => setSelected(m)}
            >
              {m.kind === 'pdf' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', fontSize: '2rem', background: 'var(--cream-2)' }}>📄</div>
              ) : (
                <Img src={m.url} alt="" />
              )}
              <div className="media-name">{m.originalName || m.filename}</div>
              {m.usageCount > 0 && <span className="media-usage">{m.usageCount}×</span>}
            </button>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
      <div className="modal-actions">
        <button type="button" className="btn btn-light" onClick={onClose}>{t('common.cancel')}</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!selected}
          onClick={() => { onSelect(selected); setSelected(null); }}
        >
          {t('common.confirm')}
        </button>
      </div>
    </Modal>
  );
}

/** Single-image field with preview + picker. */
export function ImageField({ value, onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div>
          <Img src={value} alt="" className="image-picker-preview" style={{ aspectRatio: '16/9', objectFit: 'cover' }} />
          <div className="flex gap-2 mt-2 wrap">
            <button type="button" className="btn btn-light btn-sm" onClick={() => setOpen(true)}>{t('admin.form.changeImage')}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>{t('admin.form.removeImage')}</button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>🖼 {t('admin.form.pickImage')}</button>
      )}
      <MediaPickerModal open={open} onClose={() => setOpen(false)} onSelect={(m) => { onChange(m.url); setOpen(false); }} />
    </div>
  );
}

/** Multi-image field. */
export function ImagesField({ value = [], onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const move = (i, dir) => {
    const arr = [...value];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange(arr);
  };
  return (
    <div className="field">
      <label>{label}</label>
      <div className="flex gap-2 wrap">
        {value.map((url, i) => (
          <div key={url + i} style={{ position: 'relative', width: 110 }}>
            <Img src={url} alt="" style={{ width: 110, height: 78, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
            <div className="flex" style={{ gap: 2, marginTop: 4 }}>
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} aria-label="Move left">‹</button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} aria-label="Move right">›</button>
              <button type="button" className="icon-btn danger" onClick={() => onChange(value.filter((_, idx) => idx !== i))} aria-label="Remove">✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf: 'center' }} onClick={() => setOpen(true)}>
          ＋ {t('admin.form.addImages')}
        </button>
      </div>
      <MediaPickerModal open={open} onClose={() => setOpen(false)} onSelect={(m) => { if (!value.includes(m.url)) onChange([...value, m.url]); setOpen(false); }} />
    </div>
  );
}

/** PDF field using media library. */
export function PdfField({ value, name, onChange, label }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      {value ? (
        <div className="flex gap-2 wrap" style={{ alignItems: 'center' }}>
          <a href={value} target="_blank" rel="noopener noreferrer" className="chip chip-gold">📄 {name || 'PDF'}</a>
          <button type="button" className="btn btn-light btn-sm" onClick={() => setOpen(true)}>{t('admin.form.changeImage')}</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('', '')}>{t('admin.form.removeImage')}</button>
        </div>
      ) : (
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>📄 {t('admin.media.uploadPdf')}</button>
      )}
      <MediaPickerModal open={open} onClose={() => setOpen(false)} kind="pdf" onSelect={(m) => { onChange(m.url, m.originalName || m.filename); setOpen(false); }} />
    </div>
  );
}
