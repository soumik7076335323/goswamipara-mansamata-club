import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import Seo from '../../components/ui/Seo';
import PageHero from '../../components/ui/PageHero';
import { EmptyState, CardSkeletons, ErrorState, Pagination } from '../../components/ui';
import { ActivityCard } from '../../components/cards';

export default function SocialActivities() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const { data, loading, error, refetch } = useFetch('/api/social-activities', {
    params: { page, limit: 9, category: category || undefined },
  });

  const categories = React.useMemo(() => {
    const set = new Set();
    (data?.items || []).forEach((i) => i.category && set.add(i.category));
    return Array.from(set);
  }, [data]);

  return (
    <>
      <Seo title={t('nav.socialActivities')} description={t('social.subtitle')} />
      <PageHero title={t('social.title')} subtitle={t('social.subtitle')} />
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <div className="filter-bar">
              <select className="select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} aria-label={t('common.category')}>
                <option value="">{t('common.allCategories')}</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          {loading ? <CardSkeletons count={6} /> : error ? <ErrorState onRetry={refetch} /> : !data || data.items.length === 0 ? (
            <EmptyState icon="🤝" title={t('social.empty')} text={t('common.empty.admin')} />
          ) : (
            <>
              <div className="grid grid-3">{data.items.map((i) => <ActivityCard key={i._id} item={i} />)}</div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
