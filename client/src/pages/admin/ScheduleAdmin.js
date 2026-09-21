import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal, ConfirmDialog, Spinner, EmptyState } from '../../components/ui';
import { LocalizedField, TextField, CheckField } from './components/fields';
import { toDateInput, formatDate } from '../../utils/format';

const blank = {
  dayLabel: { bn: '', en: '' },
  date: '',
  time: '',
  title: { bn: '', en: '' },
  description: { bn: '', en: '' },
  location: { bn: '', en: '' },
  displayOrder: 0,
  published: true,
};

export default function ScheduleAdmin() {
  const { t, L, lang } = useLanguage();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [pujas, setPujas] = useState(null);
  const [pujaId, setPujaId] = useState(params.get('puja') || '');
  const [items, setItems] = useState(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/puja/admin/list');
        setPujas(data.items);
        if (!pujaId && data.items[0]) setPujaId(data.items[0]._id);
      } catch (e) {
        toast.error(e.friendlyMessage);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(async () => {
    if (!pujaId) { setItems([]); return; }
    try {
      const { data } = await api.get(`/api/puja/${pujaId}/schedule/all`);
      setItems(data.items);
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  }, [pujaId, toast]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v && v.target !== undefined ? v.target.value : v }));
  const openCreate = () => { setEditing(null); setForm(blank); setError(''); setOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...blank, ...item, date: toDateInput(item.date) }); setError(''); setOpen(true); };

  const save = async () => {
    if ((!form.title.bn && !form.title.en) || !form.date) { setError(t('common.required')); return; }
    setBusy(true);
    setError('');
    const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
    try {
      if (editing) await api.put(`/api/puja/schedule/${editing._id}`, payload);
      else await api.post(`/api/puja/${pujaId}/schedule`, payload);
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
      await api.delete(`/api/puja/schedule/${toDelete._id}`);
      toast.success(t('common.deleted'));
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  if (!pujas) return <Spinner />;

  return (
    <div>
      <div className="admin-page-head">
        <div><h1>{t('admin.nav.schedule')}</h1><p>{t('admin.schedule.selectPuja')}</p></div>
        {pujaId && <button type="button" className="btn btn-primary" onClick={openCreate}>＋ {t('admin.schedule.addItem')}</button>}
      </div>
      <div className="filter-bar">
        <select
          className="select"
          value={pujaId}
          onChange={(e) => { setPujaId(e.target.value); setParams({ puja: e.target.value }); }}
          aria-label={t('admin.schedule.selectPuja')}
        >
          {pujas.map((p) => <option key={p._id} value={p._id}>{L(p.title)} ({p.year})</option>)}
        </select>
      </div>
      {!pujaId ? (
        <EmptyState icon="🪔" title={t('admin.schedule.selectPuja')} />
      ) : !items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon="🗓" title={t('admin.list.empty')} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>{t('common.date')}</th><th>{t('admin.schedule.dayLabel')}</th><th>{t('common.title')}</th><th>{t('common.time')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{formatDate(item.date, lang)}</td>
                  <td>{L(item.dayLabel, '—')}</td>
                  <td><strong>{L(item.title)}</strong></td>
                  <td>{item.time || '—'}</td>
                  <td>
                    <button type="button" className={`badge-dot icon-btn ${item.published ? 'text-green' : 'text-muted2'}`}
                      onClick={async () => { await api.put(`/api/puja/schedule/${item._id}`, { published: !item.published }); load(); }}>
                      {item.published ? t('common.published') : t('common.unpublished')}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEdit(item)}>{t('common.edit')}</button>
                      <button type="button" className="icon-btn danger" onClick={() => setToDelete(item)}>{t('common.delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? t('common.edit') : t('admin.schedule.addItem')} wide>
        {error && <div className="empty-state" role="alert" style={{ padding: 12, marginBottom: 12, color: 'var(--red-danger)' }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 18px' }}>
          <LocalizedField label={t('admin.schedule.dayLabel')} value={form.dayLabel} onChange={set('dayLabel')} placeholder="মহাষ্টমী / Maha Ashtami" />
          <TextField label={t('common.date')} type="date" value={form.date} onChange={set('date')} required />
          <TextField label={t('common.time')} value={form.time} onChange={set('time')} hint="সকাল ৯টা / 9:00 AM" />
          <LocalizedField label={t('common.title')} value={form.title} onChange={set('title')} required />
          <LocalizedField label={t('common.description')} textarea value={form.description} onChange={set('description')} />
          <LocalizedField label={t('common.location')} value={form.location} onChange={set('location')} />
          <TextField label={t('common.order')} type="number" value={form.displayOrder} onChange={set('displayOrder')} />
          <CheckField label={t('field.published')} checked={form.published} onChange={set('published')} />
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
