import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Spinner } from '../../components/ui';
import { LocalizedField, TextField } from './components/fields';
import { ImageField } from './components/ImagePicker';

export default function SettingsAdmin() {
  const { t } = useLanguage();
  const toast = useToast();
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/api/settings');
    setForm({
      ...data,
      socialLinks: data.socialLinks || [],
    });
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v && v.target !== undefined ? v.target.value : v }));
  const setSeo = (k) => (v) => setForm((f) => ({ ...f, seo: { ...(f.seo || {}), [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        clubName: form.clubName,
        establishedYear: Number(form.establishedYear) || undefined,
        registrationNumber: form.registrationNumber,
        address: form.address,
        mapUrl: form.mapUrl,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        logo: form.logo,
        favicon: form.favicon,
        seo: form.seo,
        socialLinks: (form.socialLinks || []).filter((s) => s.label && s.url),
        footerText: form.footerText,
        aboutIntro: form.aboutIntro,
      };
      await api.put('/api/settings', payload);
      toast.success(t('admin.settings.saved'));
      refreshSettings();
    } catch (e) {
      toast.error(e.friendlyMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <Spinner />;

  const updateLink = (i, k, v) => setForm((f) => {
    const links = [...f.socialLinks];
    links[i] = { ...links[i], [k]: v };
    return { ...f, socialLinks: links };
  });

  return (
    <div>
      <div className="admin-page-head">
        <div><h1>{t('admin.nav.settings')}</h1></div>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </div>

      <div className="admin-form">
        <h3>{t('admin.settings.clubInfo')}</h3>
        <LocalizedField label="Club name / ক্লাবের নাম" value={form.clubName} onChange={set('clubName')} required />
        <div className="form-row">
          <TextField label={t('common.established')} type="number" value={form.establishedYear} onChange={set('establishedYear')} />
          <TextField label={t('common.registrationNo')} value={form.registrationNumber} onChange={set('registrationNumber')} />
        </div>
        <LocalizedField label={t('common.address')} textarea value={form.address} onChange={set('address')} />
        <TextField label="Google Maps URL" value={form.mapUrl} onChange={set('mapUrl')} />
        <div className="form-row">
          <TextField label={t('common.email')} type="email" value={form.contactEmail} onChange={set('contactEmail')} />
          <TextField label={t('common.phone')} value={form.contactPhone} onChange={set('contactPhone')} />
        </div>

        <h3>{t('admin.settings.identity')}</h3>
        <div className="form-row">
          <ImageField label="Logo" value={form.logo} onChange={set('logo')} />
          <ImageField label="Favicon" value={form.favicon} onChange={set('favicon')} />
        </div>
        <LocalizedField label="Footer text" textarea value={form.footerText} onChange={set('footerText')} />
        <LocalizedField label="About intro / পরিচিতি" textarea value={form.aboutIntro} onChange={set('aboutIntro')} />

        <h3>{t('admin.settings.seo')}</h3>
        <LocalizedField label="Site title suffix" value={form.seo?.siteSuffix} onChange={setSeo('siteSuffix')} />
        <LocalizedField label="Meta description" value={form.seo?.metaDescription} onChange={setSeo('metaDescription')} />
        <ImageField label="Default OG image" value={form.seo?.ogImage || ''} onChange={setSeo('ogImage')} />

        <h3>{t('admin.settings.social')}</h3>
        {(form.socialLinks || []).map((link, i) => (
          <div className="form-row" key={i}>
            <TextField label="Label" value={link.label} onChange={(v) => updateLink(i, 'label', v)} />
            <div className="field">
              <label>URL</label>
              <div className="flex gap-2">
                <input className="input" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} />
                <button type="button" className="icon-btn danger" onClick={() => setForm((f) => ({ ...f, socialLinks: f.socialLinks.filter((_, idx) => idx !== i) }))} aria-label={t('common.delete')}>✕</button>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setForm((f) => ({ ...f, socialLinks: [...(f.socialLinks || []), { label: '', url: '' }] }))}>
          ＋ {t('admin.settings.addLink')}
        </button>
      </div>
    </div>
  );
}
