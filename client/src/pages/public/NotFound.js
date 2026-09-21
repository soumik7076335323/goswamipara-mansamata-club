import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import Seo from '../../components/ui/Seo';
import { MotifMark } from '../../components/ui';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <>
      <Seo title="404" />
      <section className="section" style={{ minHeight: '52vh', display: 'flex', alignItems: 'center' }}>
        <div className="container center">
          <MotifMark width={72} height={72} opacity={0.4} />
          <h1 style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', color: 'var(--vermilion)', margin: '10px 0 0' }}>৪০৪</h1>
          <h2>{t('notfound.title')}</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 460, margin: '0 auto 26px' }}>{t('notfound.text')}</p>
          <Link to="/" className="btn btn-primary">{t('notfound.home')}</Link>
        </div>
      </section>
    </>
  );
}
