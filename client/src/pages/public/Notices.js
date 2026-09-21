import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination, Modal } from '../../components/ui';
import { NoticeLine } from '../../components/cards';
import { formatDate } from '../../utils/format';

export default function Notices() {
  const { t, L, lang } = useLanguage();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const { data, loading, error, refetch } = useFetch('/api/notices', {
    params: { q: search || undefined, page, limit: 10 },
  });

  return (
    <>
      <Seo title={t('nav.notices')} description={t('notices.subtitle')} />
      <PageHero title={t('notices.title')} subtitle={t('notices.subtitle')} />
      <section className="section">
        <div className="container" style={{ maxWidth: 860 }}>
          <form
            className="filter-bar"
            onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }}
            role="search"
          >
            <input
              className="input search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('notices.searchPlaceholder')}
              aria-label={t('common.search')}
            />
            <button type="submit" className="btn btn-primary btn-sm">{t('common.search')}</button>
          </form>
          {loading ? (
            <CardSkeletons count={3} />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : !data || data.items.length === 0 ? (
            <EmptyState icon="📋" title={t('notices.empty')} />
          ) : (
            <>
              <div className="admin-table-wrap">
                {data.items.map((n) => <NoticeLine key={n._id} notice={n} onOpen={setOpen} />)}
              </div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open ? L(open.title) : ''} wide>
        {open && (
          <div>
            <div className="card-meta" style={{ padding: 0, marginBottom: 10 }}>{formatDate(open.date, lang)}</div>
            <div className="prose">{L(open.content) || L(open.title)}</div>
            {open.attachmentUrl && (
              <a className="btn btn-outline btn-sm mt-2" href={open.attachmentUrl} target="_blank" rel="noopener noreferrer">
                ⤓ {t('notices.attachment')}
              </a>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
