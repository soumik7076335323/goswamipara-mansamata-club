import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { Spinner } from '../../components/ui';
import { LocalizedField } from './components/fields';
import { ImageField, ImagesField } from './components/ImagePicker';
import VideosSelect from './components/VideosSelect';

/** Editor for singleton documents (Mansa Mandir, Club History). */
export default function SingletonEditor({ endpoint, fields, titleKey }) {
  const { t } = useLanguage();
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(endpoint);
      setForm(data);
    } catch (e) {
      toast.error(e.friendlyMessage);
    }
  }, [endpoint, toast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((f) => { payload[f.name] = form[f.name]; });
      const { data } = await api.put(endpoint, payload);
      setForm(data);
      toast.success(t('common.saved'));
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <Spinner />;

  return (
    <div>
      <div className="admin-page-head">
        <div><h1>{t(titleKey)}</h1></div>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </div>
      <div className="admin-form" style={{ maxWidth: 920 }}>
        {fields.map((f) => {
          if (f.type === 'image') {
            return <ImageField key={f.name} label={f.label} value={form[f.name]} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
          }
          if (f.type === 'images') {
            return <ImagesField key={f.name} label={f.label} value={form[f.name] || []} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
          }
          if (f.type === 'videosSelect') {
            const ids = (form[f.name] || []).map((v) => (v && v._id ? v._id : v));
            return <VideosSelect key={f.name} label={f.label} value={ids} onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))} />;
          }
          return (
            <LocalizedField
              key={f.name}
              label={f.label}
              textarea={f.textarea !== false}
              value={form[f.name]}
              onChange={(v) => setForm((o) => ({ ...o, [f.name]: v }))}
            />
          );
        })}
      </div>
    </div>
  );
}
