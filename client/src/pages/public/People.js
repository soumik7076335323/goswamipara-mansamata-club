import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination } from '../../components/ui';
import { PersonCard } from '../../components/cards';

export function CommitteePage() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/committee', { params: { page, limit: 12 } });

  return (
    <>
      <Seo title={t('nav.committee')} description={t('committee.subtitle')} />
      <PageHero title={t('committee.title')} subtitle={t('committee.subtitle')} />
      <section className="section">
        <div className="container">
          {loading ? <CardSkeletons count={4} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="👥" title={t('committee.empty')} />
          ) : (
            <>
              <div className="grid grid-4">{data.items.map((p) => <PersonCard key={p._id} person={p} committee />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function MembersPage() {
  const { t } = useLanguage();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/members', {
    params: { q: search || undefined, page, limit: 12 },
  });

  return (
    <>
      <Seo title={t('nav.members')} description={t('members.subtitle')} />
      <PageHero title={t('members.title')} subtitle={t('members.subtitle')} />
      <section className="section">
        <div className="container">
          <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); setSearch(q); setPage(1); }} role="search">
            <input
              className="input search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('members.searchPlaceholder')}
              aria-label={t('common.search')}
            />
            <button type="submit" className="btn btn-primary btn-sm">{t('common.search')}</button>
          </form>
          {loading ? <CardSkeletons count={4} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="🪪" title={t('members.empty')} />
          ) : (
            <>
              <div className="grid grid-4">{data.items.map((p) => <PersonCard key={p._id} person={p} />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
