import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { SectionHead, Img, EmptyState } from '../../components/ui';
import { Link } from 'react-router-dom';

export default function About() {
  const { t, L } = useLanguage();
  const { settings } = useSettings();
  const { data: history } = useFetch('/api/history');
  const hasHistory = history && (history.content?.bn || history.content?.en);

  return (
    <>
      <Seo title={t('nav.about')} />
      <PageHero title={t('about.title')} subtitle={t('home.identity.text')} />
      <section className="section">
        <div className="container two-col">
          <div>
            <SectionHead eyebrow={t('about.intro.eyebrow')} title={settings ? L(settings.clubName) : ''} />
            <p className="prose">
              {settings?.aboutIntro && (settings.aboutIntro.bn || settings.aboutIntro.en)
                ? L(settings.aboutIntro)
                : t('home.identity.text')}
            </p>
            <p className="prose" style={{ color: 'var(--muted)' }}>{t('about.identity.text')}</p>
          </div>
          <div className="info-panel">
            <h3><span className="dot" />{t('about.facts')}</h3>
            <dl className="kv">
              <dt>{t('common.established')}</dt>
              <dd><strong>{settings?.establishedYear}</strong></dd>
              <dt>{t('common.registrationNo')}</dt>
              <dd>{settings?.registrationNumber}</dd>
              <dt>{t('common.address')}</dt>
              <dd style={{ whiteSpace: 'pre-line' }}>{settings ? L(settings.address) : ''}</dd>
            </dl>
            {settings?.mapUrl && (
              <a className="btn btn-outline btn-sm mt-2" href={settings.mapUrl} target="_blank" rel="noopener noreferrer">
                ⌖ {t('common.viewOnGoogleMaps')}
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHead center title={t('about.history')} />
          {hasHistory ? (
            <div className="prose" style={{ maxWidth: 800, margin: '0 auto' }}>{L(history.content)}</div>
          ) : (
            <EmptyState icon="📜" title={t('about.history.empty')} />
          )}
          {history?.images?.length > 0 && (
            <div className="photo-grid mt-4">
              {history.images.map((url, i) => (
                <div className="photo-cell" key={i}><Img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container two-col">
          <div className="info-panel">
            <h3><span className="dot" />{t('nav.durgaPuja')}</h3>
            <p className="prose" style={{ color: 'var(--muted)' }}>{t('home.puja.title')} — {t('puja.subtitle')}</p>
            <Link to="/durga-puja" className="btn btn-primary btn-sm">{t('common.details')}</Link>
          </div>
          <div className="info-panel">
            <h3><span className="dot" />{t('nav.mansaMandir')}</h3>
            <p className="prose" style={{ color: 'var(--muted)' }}>{t('mandir.subtitle')}</p>
            <Link to="/mansa-mandir" className="btn btn-outline btn-sm">{t('common.details')}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
