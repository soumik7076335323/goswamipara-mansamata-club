import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination, Img, Spinner, Lightbox, SectionHead } from '../../components/ui';
import { ActivityCard } from '../../components/cards';
import { formatDate } from '../../utils/format';
import { VideoCard } from './Videos';

export function MemoriesList() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/memories', { params: { page, limit: 9 } });

  return (
    <>
      <Seo title={t('nav.memories')} description={t('memories.subtitle')} />
      <PageHero title={t('memories.title')} subtitle={t('memories.subtitle')} />
      <section className="section">
        <div className="container">
          {loading ? <CardSkeletons count={6} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="📷" title={t('memories.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="grid grid-3">{data.items.map((i) => <ActivityCard key={i._id} item={i} basePath="/memories" />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function MemoryDetail() {
  const { id } = useParams();
  const { t, L, lang } = useLanguage();
  const { data, loading, error } = useFetch(`/api/memories/${id}`);
  const [lightbox, setLightbox] = useState(-1);

  if (loading) return <Spinner />;
  if (error || !data) {
    return (
      <>
        <PageHero title={t('memories.title')} />
        <section className="section"><div className="container"><EmptyState icon="📷" title={t('notfound.title')} /></div></section>
      </>
    );
  }
  const photos = (data.photos || []).map((p) => ({ url: p.url, caption: p.caption }));

  return (
    <>
      <Seo title={L(data.title)} />
      <PageHero title={L(data.title)} subtitle={data.year ? String(data.year) : ''} crumbLabel={t('nav.memories')} />
      <section className="section">
        <div className="container">
          {L(data.description) && <p className="prose" style={{ maxWidth: 780 }}>{L(data.description)}</p>}
          {data.date && <p className="card-meta" style={{ padding: 0 }}>🗓 {formatDate(data.date, lang)}</p>}
          {photos.length > 0 && (
            <div className="mt-4">
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <button type="button" className="photo-cell" key={i} onClick={() => setLightbox(i)} aria-label={L(p.caption) || `Photo ${i + 1}`}>
                    <Img src={p.url} alt={L(p.caption) || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {data.videoIds?.length > 0 && (
            <div className="mt-4">
              <SectionHead title={t('mandir.videos')} />
              <div className="grid grid-3">{data.videoIds.map((v) => <VideoCard key={v._id} video={v} />)}</div>
            </div>
          )}
        </div>
      </section>
      {lightbox >= 0 && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(-1)} onNavigate={setLightbox} captionFor={(p) => L(p.caption)} />
      )}
    </>
  );
}
