import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { SectionHead, Img, EmptyState, Spinner } from '../../components/ui';
import { formatDate, dateParts, num } from '../../utils/format';

export function ScheduleList({ pujaId, emptyTitle }) {
  const { L, lang } = useLanguage();
  const { data, loading } = useFetch(`/api/puja/${pujaId}/schedule`);
  if (loading) return <Spinner />;
  if (!data || data.items.length === 0) return <EmptyState icon="🗓" title={emptyTitle} />;
  return (
    <div className="schedule-list">
      {data.items.map((item) => {
        const dp = dateParts(item.date, lang);
        return (
          <div className="schedule-item" key={item._id}>
            <div className="schedule-date">
              <b>{dp.day}</b>
              <span>{dp.month}</span>
              <span style={{ display: 'block' }}>{dp.year}</span>
            </div>
            <div>
              {L(item.dayLabel) && <div className="schedule-day-label">{L(item.dayLabel)}</div>}
              <h3>{L(item.title)}</h3>
              {L(item.description) && <p>{L(item.description)}</p>}
              <div className="schedule-meta">
                {item.time && <span>🕒 {item.time}</span>}
                {L(item.location) && <span>📍 {L(item.location)}</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DurgaPuja() {
  const { t, L, lang } = useLanguage();
  const { data: current, loading } = useFetch('/api/puja/current');
  const { data: all } = useFetch('/api/puja', { params: { limit: 20 } });
  const previous = all && current ? all.items.filter((p) => p._id !== current._id) : [];

  return (
    <>
      <Seo title={t('nav.durgaPuja')} description={t('puja.subtitle')} image={current?.bannerImage} />
      <PageHero title={t('puja.title')} subtitle={t('puja.subtitle')} />
      <section className="section">
        <div className="container">
          {loading ? (
            <Spinner />
          ) : !current ? (
            <EmptyState icon="🪔" title={t('puja.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="two-col">
                <div>
                  <span className="chip chip-vermilion">{t('puja.current')} · {num(current.year, 'en')}</span>
                  <h2 className="mt-2">{L(current.title)}</h2>
                  {L(current.theme) && (
                    <p style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '1.1rem' }}>
                      {t('puja.theme')}: {L(current.theme)}
                    </p>
                  )}
                  <p className="prose" style={{ color: 'var(--muted)' }}>{L(current.description)}</p>
                  {(current.startDate || current.endDate) && (
                    <div className="info-panel mt-2">
                      <dl className="kv">
                        {current.startDate && (<><dt>{t('puja.dates')}</dt><dd>{formatDate(current.startDate, lang)} — {formatDate(current.endDate, lang)}</dd></>)}
                      </dl>
                    </div>
                  )}
                </div>
                <div>
                  <Img src={current.bannerImage || current.featuredImage} alt={L(current.title)} className="feature-img" />
                </div>
              </div>
              <div className="mt-4">
                <SectionHead center title={t('puja.schedule')} />
                <ScheduleList pujaId={current._id} emptyTitle={t('puja.schedule.empty')} />
              </div>
            </>
          )}
        </div>
      </section>

      {previous.length > 0 && (
        <section className="section section-tint">
          <div className="container">
            <SectionHead center title={t('puja.archive')} />
            <div className="grid grid-3">
              {previous.map((p) => (
                <article className="card" key={p._id}>
                  <div className="card-media">
                    <Img src={p.featuredImage || p.bannerImage} alt={L(p.title)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className="card-body">
                    <span className="chip chip-vermilion">{num(p.year, 'en')}</span>
                    <h3 className="card-title">{L(p.title)}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section countdown-band">
        <div className="container center">
          <h2 style={{ color: '#f8efd9' }}>{t('home.puja.eyebrow')}</h2>
          <p style={{ color: '#cdbfa4', maxWidth: 560, margin: '0 auto 22px' }}>{t('puja.subtitle')}</p>
          <Link to="/gallery" className="btn btn-primary">{t('nav.gallery')}</Link>
        </div>
      </section>
    </>
  );
}
