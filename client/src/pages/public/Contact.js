import React, { useState } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { MotifMark } from '../../components/ui';

const initial = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const { t, L } = useLanguage();
  const { settings } = useSettings();
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('common.required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t('common.invalidEmail');
    if (!form.subject.trim()) errs.subject = t('common.required');
    if (!form.message.trim()) errs.message = t('common.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      await api.post('/api/contact', form);
      setSent(true);
      setForm(initial);
      toast.success(t('contact.success'));
    } catch (err) {
      toast.error(err.friendlyMessage || t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title={t('nav.contact')} description={t('contact.subtitle')} />
      <PageHero title={t('contact.title')} subtitle={t('contact.subtitle')} />
      <section className="section">
        <div className="container two-col" style={{ alignItems: 'start' }}>
          <div>
            <div className="info-panel">
              <h3><span className="dot" />{t('contact.info')}</h3>
              <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>{settings ? L(settings.clubName) : ''}</p>
              <div className="prose" style={{ color: 'var(--muted)' }}>{settings ? L(settings.address) : ''}</div>
              <dl className="kv mt-2">
                {settings?.contactEmail && (<><dt>{t('common.email')}</dt><dd><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></dd></>)}
                {settings?.contactPhone && (<><dt>{t('common.phone')}</dt><dd><a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a></dd></>)}
                <dt>{t('common.registrationNo')}</dt>
                <dd>{settings?.registrationNumber}</dd>
              </dl>
              {settings?.mapUrl && (
                <a className="btn btn-primary mt-2" href={settings.mapUrl} target="_blank" rel="noopener noreferrer">
                  ⌖ {t('common.viewOnGoogleMaps')}
                </a>
              )}
            </div>
            <div className="info-panel center" style={{ padding: 30 }}>
              <MotifMark width={64} height={64} opacity={0.85} />
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 12 }}>{t('home.identity.text')}</p>
            </div>
          </div>

          <div className="info-panel">
            <h3><span className="dot" />{t('contact.formTitle')}</h3>
            {sent && (
              <div className="empty-state" style={{ padding: 18, marginBottom: 14 }}>
                <p style={{ margin: 0 }}>{t('contact.success')}</p>
              </div>
            )}
            <form onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="c-name">{t('contact.name')}</label>
                <input id="c-name" className="input" value={form.name} onChange={set('name')} maxLength={120} />
                {errors.name && <div className="field-error" role="alert">{errors.name}</div>}
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="c-email">{t('common.email')}</label>
                  <input id="c-email" type="email" className="input" value={form.email} onChange={set('email')} maxLength={254} />
                  {errors.email && <div className="field-error" role="alert">{errors.email}</div>}
                </div>
                <div className="field">
                  <label htmlFor="c-phone">{t('contact.phoneOptional')}</label>
                  <input id="c-phone" className="input" value={form.phone} onChange={set('phone')} maxLength={20} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="c-subject">{t('contact.subject')}</label>
                <input id="c-subject" className="input" value={form.subject} onChange={set('subject')} maxLength={200} />
                {errors.subject && <div className="field-error" role="alert">{errors.subject}</div>}
              </div>
              <div className="field">
                <label htmlFor="c-message">{t('contact.message')}</label>
                <textarea id="c-message" className="textarea" value={form.message} onChange={set('message')} maxLength={5000} />
                {errors.message && <div className="field-error" role="alert">{errors.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
