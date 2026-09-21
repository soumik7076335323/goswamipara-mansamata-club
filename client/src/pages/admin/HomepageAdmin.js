import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Spinner, SectionHead } from '../../components/ui';
import { LocalizedField, TextField, CheckField } from './components/fields';
import { ImageField } from './components/ImagePicker';

const SECTION_KEYS = [
  ['showCountdown', 'home.countdown.title'],
  ['showToday', 'home.today.title'],
  ['showNotices', 'home.notices.title'],
  ['showEvents', 'home.events.title'],
  ['showGallery', 'home.gallery.title'],
  ['showMandir', 'home.mandir.title'],
  ['showCommittee', 'home.committee.title'],
  ['showMembers', 'home.members.title'],
  ['showSocial', 'home.social.title'],
  ['showMemories', 'home.memories.title'],
  ['showSouvenir', 'home.souvenir.title'],
];

export default function HomepageAdmin() {
  const { t } = useLanguage();
  const toast = useToast();
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api.get('/api/settings');
    setForm(data);
  }, []);

  useEffect(() => { load().catch(() => {}); }, [load]);

  const setHero = (k) => (v) => setForm((f) => ({ ...f, hero: { ...(f.hero || {}), [k]: v } }));
  const setCta = (cta, k) => (v) => setForm((f) => ({ ...f, hero: { ...(f.hero || {}), [cta]: { ...(f.hero?.[cta] || {}), [k]: v } } }));
  const setSection = (k) => (v) => setForm((f) => ({ ...f, homeSections: { ...(f.homeSections || {}), [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/settings', { hero: form.hero, homeSections: form.homeSections });
      toast.success(t('common.saved'));
      refreshSettings();
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
        <div><h1>{t('admin.nav.homepage')}</h1><p>Hero, CTA এবং সেকশন দৃশ্যমানতা</p></div>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </div>
      <div className="admin-form" style={{ maxWidth: 980 }}>
        <SectionHead title={t('admin.settings.heroTitle')} />
        <LocalizedField label={t('admin.settings.heroTitle')} value={form.hero?.title} onChange={setHero('title')} />
        <LocalizedField label={t('admin.settings.heroSubtitle')} value={form.hero?.subtitle} onChange={setHero('subtitle')} />
        <LocalizedField label={t('admin.settings.badge')} value={form.hero?.badge} onChange={setHero('badge')} />
        <div className="form-row">
          <div>
            <h4 style={{ marginBottom: 8 }}>{t('admin.settings.cta1')}</h4>
            <LocalizedField label="Label" value={form.hero?.cta1?.label} onChange={setCta('cta1', 'label')} />
            <TextField label={t('admin.settings.linkUrl')} value={form.hero?.cta1?.link || ''} onChange={setCta('cta1', 'link')} />
          </div>
          <div>
            <h4 style={{ marginBottom: 8 }}>{t('admin.settings.cta2')}</h4>
            <LocalizedField label="Label" value={form.hero?.cta2?.label} onChange={setCta('cta2', 'label')} />
            <TextField label={t('admin.settings.linkUrl')} value={form.hero?.cta2?.link || ''} onChange={setCta('cta2', 'link')} />
          </div>
        </div>
        <ImageField label={t('admin.settings.heroImage')} value={form.hero?.image || ''} onChange={setHero('image')} />

        <SectionHead title={t('admin.settings.homeSections')} />
        <div className="grid grid-3">
          {SECTION_KEYS.map(([k, labelKey]) => (
            <CheckField key={k} label={t(labelKey)} checked={form.homeSections?.[k] !== false} onChange={setSection(k)} />
          ))}
        </div>
      </div>
    </div>
  );
}
