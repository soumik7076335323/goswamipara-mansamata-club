import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination, Img, Spinner, Lightbox } from '../../components/ui';
import { AlbumCard } from '../../components/cards';

export function GalleryList() {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/gallery', {
    params: { q: search || undefined, page, limit: 9 },
  });

  return (
    <>
      <Seo title={t('nav.gallery')} description={t('gallery.subtitle')} />
      <PageHero title={t('gallery.title')} subtitle={t('gallery.subtitle')} />
      <section className="section">
        <div className="container">
          <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }} role="search">
            <input className="input search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search') + '…'} aria-label={t('common.search')} />
            <button type="submit" className="btn btn-primary btn-sm">{t('common.search')}</button>
          </form>
          {loading ? <CardSkeletons count={6} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="🖼" title={t('gallery.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="grid grid-3 album-grid">{data.items.map((a) => <AlbumCard key={a._id} album={a} />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function GalleryAlbumPage() {
  const { id } = useParams();
  const { t, L } = useLanguage();
  const { data: album, loading, error } = useFetch(`/api/gallery/${id}`);
  const [lightbox, setLightbox] = useState(-1);

  if (loading) return <Spinner />;
  if (error || !album) {
    return (
      <>
        <PageHero title={t('gallery.title')} />
        <section className="section"><div className="container"><EmptyState icon="🖼" title={t('notfound.title')} /></div></section>
      </>
    );
  }

  const photos = (album.images || []).map((img) => ({ url: img.url, caption: img.caption }));

  return (
    <>
      <Seo title={L(album.title)} />
      <PageHero title={L(album.title)} subtitle={L(album.description)} crumbLabel={t('nav.gallery')} />
      <section className="section">
        <div className="container">
          {photos.length === 0 ? (
            <EmptyState icon="🖼" title={t('gallery.albumEmpty')} />
          ) : (
            <div className="photo-grid">
              {photos.map((p, i) => (
                <button type="button" className="photo-cell" key={i} onClick={() => setLightbox(i)} aria-label={L(p.caption) || `Photo ${i + 1}`}>
                  <Img src={p.url} alt={L(p.caption) || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
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
