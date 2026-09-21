import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { SectionHead, EmptyState, CardSkeletons, ErrorState, Pagination, Img, Spinner, Lightbox } from '../../components/ui';
import { EventCard } from '../../components/cards';
import { formatDate } from '../../utils/format';

export function EventsList() {
  const { t } = useLanguage();
  const [when, setWhen] = useState('upcoming');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/events', {
    params: { when, category: category || undefined, page, limit: 9 },
  });

  const categories = React.useMemo(() => {
    const set = new Set();
    (data?.items || []).forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [data]);

  return (
    <>
      <Seo title={t('nav.events')} description={t('events.subtitle')} />
      <PageHero title={t('events.title')} subtitle={t('events.subtitle')} />
      <section className="section">
        <div className="container">
          <div className="filter-bar">
            <div className="localized-tabs" role="tablist">
              <button type="button" className={when === 'upcoming' ? 'active' : ''} onClick={() => { setWhen('upcoming'); setPage(1); }}>
                {t('common.upcoming')}
              </button>
              <button type="button" className={when === 'past' ? 'active' : ''} onClick={() => { setWhen('past'); setPage(1); }}>
                {t('common.past')}
              </button>
              <button type="button" className={when === '' ? 'active' : ''} onClick={() => { setWhen(''); setPage(1); }}>
                {t('common.all')}
              </button>
            </div>
            {categories.length > 0 && (
              <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label={t('common.category')}>
                <option value="">{t('common.allCategories')}</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          {loading ? (
            <CardSkeletons count={6} />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState icon="🎪" title={t('events.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="grid grid-3">{data.items.map((e) => <EventCard key={e._id} event={e} />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function EventDetail() {
  const { id } = useParams();
  const { t, L, lang } = useLanguage();
  const { data: event, loading, error } = useFetch(`/api/events/${id}`);
  const [lightbox, setLightbox] = useState(-1);

  if (loading) return <Spinner />;
  if (error || !event) return (
    <>
      <PageHero title={t('events.title')} />
      <section className="section"><div className="container"><EmptyState icon="🎪" title={t('notfound.title')} /></div></section>
    </>
  );

  const photos = (event.gallery || []).map((url) => ({ url }));

  return (
    <>
      <Seo title={L(event.title)} image={event.coverImage} />
      <PageHero title={L(event.title)} subtitle={L(event.description)} crumbLabel={t('nav.events')} />
      <section className="section">
        <div className="container">
          <div className="two-col">
            <div className="info-panel">
              <dl className="kv">
                <dt>{t('common.date')}</dt><dd>{formatDate(event.date, lang)}</dd>
                {event.time && (<><dt>{t('common.time')}</dt><dd>{event.time}</dd></>)}
                {L(event.location) && (<><dt>{t('common.location')}</dt><dd>{L(event.location)}</dd></>)}
                {event.category && (<><dt>{t('common.category')}</dt><dd>{event.category}</dd></>)}
              </dl>
              {L(event.description) && <p className="prose mt-2">{L(event.description)}</p>}
            </div>
            <div><Img src={event.coverImage} alt={L(event.title)} className="feature-img" /></div>
          </div>
          {photos.length > 0 && (
            <>
              <SectionHead title={t('common.images')} />
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <button type="button" className="photo-cell" key={i} onClick={() => setLightbox(i)} aria-label={`Photo ${i + 1}`}>
                    <Img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {lightbox >= 0 && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(-1)} onNavigate={setLightbox} captionFor={() => L(event.title)} />
      )}
    </>
  );
}
