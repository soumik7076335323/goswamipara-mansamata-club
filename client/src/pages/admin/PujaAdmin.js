import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal, ConfirmDialog, Spinner, EmptyState, Img } from '../../components/ui';
import { LocalizedField, TextField, CheckField } from './components/fields';
import { ImageField } from './components/ImagePicker';
import { toDateInput } from '../../utils/format';

const blank = {
  year: new Date().getFullYear() + 1,
  title: { bn: '', en: '' },
  theme: { bn: '', en: '' },
  description: { bn: '', en: '' },
  bannerImage: '',
  featuredImage: '',
  startDate: '',
  endDate: '',
  published: true,
  featured: false,
};

export default function PujaAdmin() {
  const { t, L } = useLanguage();
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/puja/admin/list');
      setItems(data.items);
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v && v.target !== undefined ? v.target.value : v }));

  const openCreate = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...blank, ...p, startDate: toDateInput(p.startDate), endDate: toDateInput(p.endDate) });
    setError('');
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.bn && !form.title.en) { setError(t('common.required')); return; }
    setBusy(true);
    setError('');
    const payload = { ...form, year: Number(form.year), startDate: form.startDate || undefined, endDate: form.endDate || undefined };
    try {
      if (editing) await api.put(`/api/puja/${editing._id}`, payload);
      else await api.post('/api/puja', payload);
      toast.success(t('common.saved'));
      setOpen(false);
      load();
    } catch (e) {
      setError(e.friendlyMessage);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/api/puja/${toDelete._id}`);
      toast.success(t('common.deleted'));
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  if (!items) return <Spinner />;

  return (
    <div>
      <div className="admin-page-head">
        <div><h1>{t('admin.nav.puja')}</h1><p>{t('admin.list.total')}: {items.length}</p></div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>＋ {t('admin.list.addNew')}</button>
      </div>
      {items.length === 0 ? (
        <EmptyState icon="🪔" title={t('admin.list.empty')} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('common.image')}</th><th>{t('common.title')}</th><th>{t('common.year')}</th>
                <th>{t('common.status')}</th><th>{t('common.featured')}</th><th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><Img src={p.bannerImage || p.featuredImage} alt="" className="thumb" /></td>
                  <td><strong>{L(p.title)}</strong></td>
                  <td>{p.year}</td>
                  <td>
                    <button type="button" className={`badge-dot icon-btn ${p.published ? 'text-green' : 'text-muted2'}`}
                      onClick={async () => { await api.put(`/api/puja/${p._id}`, { published: !p.published }); load(); }}>
                      {p.published ? t('common.published') : t('common.unpublished')}
                    </button>
                  </td>
                  <td>
                    <button type="button" className={`badge-dot icon-btn ${p.featured ? 'text-green' : 'text-muted2'}`}
                      onClick={async () => { await api.put(`/api/puja/${p._id}`, { featured: !p.featured }); load(); }}>
                      {p.featured ? t('common.yes') : t('common.no')}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link className="icon-btn" to={`/admin/puja-schedule?puja=${p._id}`}>{t('admin.puja.manageSchedule')}</Link>
                      <button type="button" className="icon-btn" onClick={() => openEdit(p)}>{t('common.edit')}</button>
                      <button type="button" className="icon-btn danger" onClick={() => setToDelete(p)}>{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('common.edit') : t('admin.list.addNew')} wide>
        {error && <div className="empty-state" role="alert" style={{ padding: 12, marginBottom: 12, color: 'var(--red-danger)' }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 18px' }}>
          <TextField label={t('admin.puja.year')} type="number" value={form.year} onChange={set('year')} required />
          <LocalizedField label={t('common.title')} value={form.title} onChange={set('title')} required />
          <LocalizedField label={t('admin.puja.themeField')} value={form.theme} onChange={set('theme')} />
          <LocalizedField label={t('common.description')} textarea value={form.description} onChange={set('description')} />
          <TextField label={t('admin.puja.startDate')} type="date" value={form.startDate} onChange={set('startDate')} />
          <TextField label={t('admin.puja.endDate')} type="date" value={form.endDate} onChange={set('endDate')} />
          <ImageField label={t('admin.puja.banner')} value={form.bannerImage} onChange={set('bannerImage')} />
          <ImageField label="Featured image" value={form.featuredImage} onChange={set('featuredImage')} />
          <CheckField label={t('field.published')} checked={form.published} onChange={set('published')} />
          <CheckField label={t('field.featured')} checked={form.featured} onChange={set('featured')} />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={() => setOpen(false)} disabled={busy}>{t('common.cancel')}</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>{busy ? t('common.loading') : t('common.save')}</button>
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} title={t('common.delete')} text={t('common.deleteConfirm')} />
    </div>
  );
}
