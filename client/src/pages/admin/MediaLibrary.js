import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal, ConfirmDialog, Spinner, Pagination, Img, EmptyState } from '../../components/ui';
import { LocalizedField } from './components/fields';
import { IMAGE_MIMES, MAX_IMAGE_MB, uploadImages, uploadPdf } from './components/ImagePicker';

export default function MediaLibrary() {
  const { t } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [uploading, setUploading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editMeta, setEditMeta] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [inUse, setInUse] = useState(null);
  const fileRef = useRef(null);
  const replaceRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/media', { params: { page, limit: 24, q: q || undefined, kind: kind || undefined } });
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  }, [page, q, kind, toast]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (files, isPdf) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (!isPdf) {
      if (list.some((f) => !IMAGE_MIMES.includes(f.type))) { toast.error(t('admin.media.invalid')); return; }
      if (list.some((f) => f.size > MAX_IMAGE_MB * 1024 * 1024)) { toast.error(t('admin.media.tooLarge')); return; }
    }
    setUploading(true);
    try {
      if (isPdf) await uploadPdf(list[0]);
      else await uploadImages(list);
      toast.success(t('common.saved'));
      setPage(1);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const doDelete = async (force = false) => {
    try {
      await api.delete(`/api/media/${toDelete._id}${force ? '?force=true' : ''}`);
      toast.success(t('common.deleted'));
      setToDelete(null);
      setInUse(null);
      setDetail(null);
      load();
    } catch (e) {
      if (e.status === 409 && e.payload) {
        setInUse(e.payload);
      } else {
        toast.error(e.friendlyMessage);
      }
    }
  };

  const doReplace = async (file) => {
    if (!file || !detail) return;
    if (!IMAGE_MIMES.includes(file.type)) { toast.error(t('admin.media.invalid')); return; }
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/api/media/${detail._id}/replace`, fd);
      toast.success(t('common.updated'));
      setDetail(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      if (replaceRef.current) replaceRef.current.value = '';
    }
  };

  const saveMeta = async () => {
    try {
      await api.patch(`/api/media/${editMeta._id}`, { alt: editMeta.alt, caption: editMeta.caption });
      toast.success(t('common.saved'));
      setEditMeta(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>{t('admin.media.title')}</h1>
          <p>{t('admin.list.total')}: {pagination.total || 0}</p>
        </div>
        <div className="flex gap-2 wrap">
          <button type="button" className="btn btn-primary" disabled={uploading} onClick={() => fileRef.current && fileRef.current.click()}>
            {uploading ? t('admin.form.uploading') : `＋ ${t('admin.media.upload')}`}
          </button>
          <input ref={fileRef} type="file" accept={IMAGE_MIMES.join(',')} multiple hidden onChange={(e) => handleUpload(e.target.files, false)} />
          <button type="button" className="btn btn-outline" disabled={uploading} onClick={() => { const el = fileRef.current; if (el) { el.accept = 'application/pdf'; el.multiple = false; el.click(); setTimeout(() => { el.accept = IMAGE_MIMES.join(','); el.multiple = true; }, 0); } }}>
            📄 {t('admin.media.uploadPdf')}
          </button>
        </div>
      </div>
      <div className="filter-bar">
        <input className="input search-input" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t('common.search') + '…'} aria-label={t('common.search')} />
        <select className="select" value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="Filter by type">
          <option value="">{t('common.all')}</option>
          <option value="image">{t('common.images')}</option>
          <option value="pdf">PDF</option>
        </select>
      </div>
      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon="❏" title={t('common.empty.generic')} />
      ) : (
        <div className="media-grid">
          {items.map((m) => (
            <button type="button" key={m._id} className="media-cell" onClick={() => setDetail(m)}>
              {m.kind === 'pdf' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1', fontSize: '2.2rem', background: 'var(--cream-2)' }}>📄</div>
              ) : (
                <Img src={m.url} alt="" />
              )}
              <div className="media-name">{m.originalName || m.filename}</div>
              {m.usageCount > 0 && (
                <span className="media-usage">{m.usageCount} {t('admin.media.usedIn')}</span>
              )}
            </button>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />

      {/* Detail modal */}
      <Modal open={Boolean(detail) && !inUse} onClose={() => setDetail(null)} title={detail ? (detail.originalName || detail.filename) : ''}>
        {detail && (
          <div>
            {detail.kind === 'pdf' ? (
              <a href={detail.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">📄 {t('common.view')}</a>
            ) : (
              <Img src={detail.url} alt="" className="image-picker-preview" />
            )}
            <div className="kv mt-2">
              <dt>URL</dt><dd style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>{detail.url}</dd>
              <dt>Type</dt><dd>{detail.mimeType}</dd>
              {detail.width > 0 && (<><dt>Size</dt><dd>{detail.width}×{detail.height}px · {Math.round(detail.size / 1024)} KB</dd></>)}
              <dt>Usage</dt>
              <dd>
                {detail.usageCount > 0 ? `${detail.usageCount} ${t('admin.media.usedIn')}` : t('admin.media.unused')}
                {detail.usedIn && detail.usedIn.length > 0 && (
                  <ul className="list-plain" style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--muted)' }}>
                    {detail.usedIn.map((u) => <li key={u.id}>• {u.collection}: {u.title}</li>)}
                  </ul>
                )}
              </dd>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'flex-start' }}>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setEditMeta({ ...detail })}>{t('common.edit')}</button>
              <button type="button" className="btn btn-light btn-sm" onClick={() => replaceRef.current && replaceRef.current.click()}>{t('admin.media.replace')}</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setToDelete(detail)}>{t('common.delete')}</button>
              <input ref={replaceRef} type="file" accept={IMAGE_MIMES.join(',')} hidden onChange={(e) => doReplace(e.target.files[0])} />
            </div>
          </div>
        )}
      </Modal>

      {/* Meta edit modal */}
      <Modal open={Boolean(editMeta)} onClose={() => setEditMeta(null)} title={t('common.edit')}>
        {editMeta && (
          <div>
            <LocalizedField label={t('admin.media.altText')} value={editMeta.alt} onChange={(v) => setEditMeta((m) => ({ ...m, alt: v }))} />
            <LocalizedField label={t('admin.media.caption')} value={editMeta.caption} onChange={(v) => setEditMeta((m) => ({ ...m, caption: v }))} />
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setEditMeta(null)}>{t('common.cancel')}</button>
              <button type="button" className="btn btn-primary" onClick={saveMeta}>{t('common.save')}</button>
            </div>
          </div>
        )}
      </Modal>

      {/* In-use warning */}
      <Modal open={Boolean(inUse)} onClose={() => setInUse(null)} title={t('admin.media.inUseTitle')}>
        <p style={{ color: 'var(--muted)' }}>{t('admin.media.inUseText')}</p>
        {inUse && (
          <ul className="list-plain" style={{ fontSize: '0.86rem' }}>
            {inUse.usedIn.map((u) => <li key={u.id} style={{ padding: '4px 0' }}>• <strong>{u.collection}</strong>: {u.title}</li>)}
          </ul>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={() => setInUse(null)}>{t('common.cancel')}</button>
          <button type="button" className="btn btn-danger" onClick={() => doDelete(true)}>{t('admin.media.forceDelete')}</button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete) && !inUse}
        onClose={() => setToDelete(null)}
        onConfirm={() => doDelete(false)}
        title={t('common.delete')}
        text={t('common.deleteConfirm')}
      />
    </div>
  );
}
