import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal, ConfirmDialog, Spinner, Pagination, EmptyState } from '../../components/ui';
import { LocalizedField, TextField, CheckField } from './components/fields';
import { ImageField, ImagesField, PdfField } from './components/ImagePicker';
import VideosSelect from './components/VideosSelect';
import { toDateInput } from '../../utils/format';

function emptyLocalised() {
  return { bn: '', en: '' };
}

function buildInitial(fields, base) {
  const out = { ...(base || {}) };
  fields.forEach((f) => {
    if (out[f.name] !== undefined) return;
    switch (f.type) {
      case 'localized':
      case 'localizedText':
        out[f.name] = emptyLocalised();
        break;
      case 'images':
        out[f.name] = [];
        break;
      case 'checkbox':
        out[f.name] = Boolean(f.default);
        break;
      case 'number':
        out[f.name] = f.default !== undefined ? f.default : 0;
        break;
      default:
        out[f.name] = f.default !== undefined ? f.default : '';
    }
  });
  return out;
}

function localizeFromItem(item, fields) {
  const out = { ...item };
  fields.forEach((f) => {
    switch (f.type) {
      case 'localized':
      case 'localizedText':
        out[f.name] = { ...emptyLocalised(), ...(item[f.name] || {}) };
        break;
      case 'images':
        out[f.name] = item[f.name] || [];
        break;
      case 'date':
        out[f.name] = toDateInput(item[f.name]);
        break;
      default:
        out[f.name] = item[f.name] !== undefined && item[f.name] !== null ? item[f.name] : '';
    }
  });
  return out;
}

export default function CrudPage({ config }) {
  const { t, L } = useLanguage();
  const toast = useToast();
  const {
    endpoint,
    titleKey,
    subtitleKey,
    columns,
    fields,
    canAdd = true,
    canDelete = true,
    searchPlaceholder,
    filters = [],
  } = config;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filterVals, setFilterVals] = useState({});
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // item being edited or null for new
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, q: q || undefined, ...filterVals };
      const { data } = await api.get(`${endpoint}/admin/list`, { params });
      setItems(data.items);
      setPagination(data.pagination || { page: 1, pages: 1, total: data.items.length });
    } catch (err) {
      toast.error(err.friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, q, filterVals, toast]);

  const [searchParams] = useSearchParams();
  const autoOpened = React.useRef(false);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (searchParams.get('new') === '1' && canAdd && !autoOpened.current) {
      autoOpened.current = true;
      openCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const openCreate = () => {
    setEditing(null);
    setForm(buildInitial(fields, config.defaultItem));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    const base = config.mapForEdit ? config.mapForEdit(item) : item;
    setForm(localizeFromItem(base, fields));
    setFormError('');
    setModalOpen(true);
  };


  const validate = () => {
    for (const f of fields) {
      if (!f.required) continue;
      const v = form[f.name];
      if (f.type === 'localized') {
        if (!v || (!String(v.bn || '').trim() && !String(v.en || '').trim())) {
          return `${f.label}: ${t('common.required')}`;
        }
      } else if (f.type === 'number') {
        if (v === '' || v === undefined || Number.isNaN(Number(v))) return `${f.label}: ${t('common.required')}`;
      } else if (!v) {
        return `${f.label}: ${t('common.required')}`;
      }
    }
    return '';
  };

  const save = async () => {
    const err = validate();
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = config.toPayload ? config.toPayload(form) : form;
      if (editing) {
        await api.put(`${endpoint}/${editing._id}`, payload);
        toast.success(t('common.updated'));
      } else {
        await api.post(endpoint, payload);
        toast.success(t('common.created'));
      }
      setModalOpen(false);
      load();
    } catch (e) {
      setFormError(e.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${toDelete._id}`);
      toast.success(t('common.deleted'));
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setDeleting(false);
    }
  };

  const toggleFlag = async (item, key) => {
    try {
      await api.put(`${endpoint}/${item._id}`, { [key]: !item[key] });
      load();
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  };

  const fieldNode = (f) => {
    switch (f.type) {
      case 'localized':
        return <LocalizedField key={f.name} label={f.label} value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} required={f.required} />;
      case 'localizedText':
        return <LocalizedField key={f.name} label={f.label} textarea value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
      case 'image':
        return <ImageField key={f.name} label={f.label} value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
      case 'images':
        return <ImagesField key={f.name} label={f.label} value={form[f.name] || []} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
      case 'pdf':
        return (
          <PdfField
            key={f.name}
            label={f.label}
            value={form[f.name]}
            name={form[f.nameField]}
            onChange={(url, name) => setForm((o) => ({ ...o, [f.name]: url, [f.nameField]: name }))}
          />
        );
      case 'videosSelect':
        return <VideosSelect key={f.name} label={f.label} value={form[f.name] || []} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
      case 'checkbox':
        return <CheckField key={f.name} label={f.label} checked={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
      case 'number':
        return <TextField key={f.name} label={f.label} type="number" value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} required={f.required} hint={f.hint} />;
      case 'date':
        return <TextField key={f.name} label={f.label} type="date" value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} required={f.required} hint={f.hint} />;
      case 'select':
        return <TextField key={f.name} label={f.label} options={f.options} value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} required={f.required} hint={f.hint} />;
      default:
        return <TextField key={f.name} label={f.label} value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} required={f.required} hint={f.hint} />;
    }
  };

  const toggleColumns = useMemo(() => (config.toggles || []).map((key) => ({
    key,
    label: key === 'published' ? t('common.published') : key === 'featured' ? t('common.featured') : key === 'active' ? t('common.active') : key === 'pinned' ? t('common.pinned') : key,
  })), [config.toggles, t]);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>{t(titleKey)}</h1>
          {subtitleKey && <p>{t(subtitleKey)}</p>}
          <p>{t('admin.list.total')}: {pagination.total}</p>
        </div>
        {canAdd && <button type="button" className="btn btn-primary" onClick={openCreate}>＋ {t('admin.list.addNew')}</button>}
      </div>

      <div className="filter-bar">
        <input
          className="input search-input"
          placeholder={searchPlaceholder ? t('common.search') + '…' : t('common.search') + '…'}
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          aria-label={t('common.search')}
        />
        {filters.map((f) => (
          <select
            key={f.param}
            className="select"
            value={filterVals[f.param] || ''}
            onChange={(e) => { setFilterVals((o) => ({ ...o, [f.param]: e.target.value || undefined })); setPage(1); }}
            aria-label={f.labelKey ? t(f.labelKey) : f.param}
          >
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.labelKey ? t(o.labelKey) : o.label}</option>)}
          </select>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState icon="🗂" title={t('admin.list.empty')} />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c.labelKey || c.label}>{c.labelKey ? t(c.labelKey) : c.label}</th>)}
                {toggleColumns.map((c) => <th key={c.key}>{c.label}</th>)}
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {columns.map((c, i) => (
                    <td key={c.labelKey || c.label || i}>{c.render(item, L)}</td>
                  ))}
                  {toggleColumns.map((c) => (
                    <td key={c.key}>
                      <button
                        type="button"
                        className={`badge-dot icon-btn ${item[c.key] ? 'text-green' : 'text-muted2'}`}
                        onClick={() => toggleFlag(item, c.key)}
                        aria-pressed={Boolean(item[c.key])}
                      >
                        {item[c.key] ? t('common.yes') : t('common.no')}
                      </button>
                    </td>
                  ))}
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEdit(item)}>{t('common.edit')}</button>
                      {canDelete && (
                        <button type="button" className="icon-btn danger" onClick={() => setToDelete(item)}>{t('common.delete')}</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t('common.edit') : t('admin.list.addNew')} wide>
        {formError && <div className="empty-state" role="alert" style={{ padding: 12, marginBottom: 12, color: 'var(--red-danger)' }}>{formError}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 18px' }}>
          {fields.map((f) => fieldNode(f))}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={() => setModalOpen(false)} disabled={saving}>{t('common.cancel')}</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? t('common.loading') : editing ? t('admin.form.update') : t('admin.form.create')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={doDelete}
        title={t('common.delete')}
        text={t('common.deleteConfirm')}
        busy={deleting}
      />
    </div>
  );
}
