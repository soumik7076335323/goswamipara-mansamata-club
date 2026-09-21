import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { SectionHead, EmptyState, Img, Spinner, Lightbox } from '../../components/ui';
import { VideoCard } from './Videos';

function InfoBlock({ title, text }) {
  if (!text) return null;
  return (
    <div className="info-panel">
      <h3><span className="dot" />{title}</h3>
      <div className="prose" style={{ color: 'var(--charcoal-2)' }}>{text}</div>
    </div>
  );
}

export default function MansaMandir() {
  const { t, L } = useLanguage();
  const { data, loading } = useFetch('/api/mansa-mandir');
  const [lightbox, setLightbox] = useState(-1);

  if (loading) return <Spinner />;
  const hasAnyText = data && ['intro', 'history', 'pujaInfo', 'visitInfo', 'specialOccasions'].some((k) => data[k] && (data[k].bn || data[k].en));
  const photos = (data?.images || []).map((url) => ({ url }));

  return (
    <>
      <Seo title={t('nav.mansaMandir')} description={t('mandir.subtitle')} image={data?.featuredImage} />
      <PageHero title={t('mandir.title')} subtitle={t('mandir.subtitle')} />
      <section className="section">
        <div className="container">
          {!hasAnyText && photos.length === 0 ? (
            <EmptyState icon="🛕" title={t('mandir.empty')} text={t('common.empty.admin')} />
          ) : (
            <div className="two-col" style={{ alignItems: 'start' }}>
              <div>
                <InfoBlock title={t('mandir.intro')} text={data ? L(data.intro) : ''} />
                <InfoBlock title={t('mandir.history')} text={data ? L(data.history) : ''} />
                <InfoBlock title={t('mandir.pujaInfo')} text={data ? L(data.pujaInfo) : ''} />
                <InfoBlock title={t('mandir.visitInfo')} text={data ? L(data.visitInfo) : ''} />
                <InfoBlock title={t('mandir.special')} text={data ? L(data.specialOccasions) : ''} />
              </div>
              <div>
                {data?.featuredImage && <Img src={data.featuredImage} alt={t('mandir.title')} className="feature-img" />}
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-4">
              <SectionHead title={t('mandir.gallery')} />
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <button type="button" className="photo-cell" key={i} onClick={() => setLightbox(i)} aria-label={`Photo ${i + 1}`}>
                    <Img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {data?.videoIds?.length > 0 && (
            <div className="mt-4">
              <SectionHead title={t('mandir.videos')} />
              <div className="grid grid-3">
                {data.videoIds.map((v) => <VideoCard key={v._id} video={v} />)}
              </div>
            </div>
          )}
        </div>
      </section>
      {lightbox >= 0 && (
        <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(-1)} onNavigate={setLightbox} captionFor={() => t('mandir.title')} />
      )}
    </>
  );
}
