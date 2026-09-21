import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination } from '../../components/ui';
import { SouvenirCard } from '../../components/cards';

export default function Souvenir() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch('/api/souvenir', { params: { page, limit: 9 } });

  return (
    <>
      <Seo title={t('nav.souvenir')} description={t('souvenir.subtitle')} />
      <PageHero title={t('souvenir.title')} subtitle={t('souvenir.subtitle')} />
      <section className="section">
        <div className="container">
          {loading ? <CardSkeletons count={6} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="📖" title={t('souvenir.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="grid grid-3">{data.items.map((i) => <SouvenirCard key={i._id} item={i} />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
