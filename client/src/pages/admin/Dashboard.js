import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { SectionHead, Spinner } from '../../components/ui';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data, loading } = useFetch('/api/admin/stats');

  const stats = data
    ? [
        ['/admin/events', t('admin.stats.events'), data.events],
        ['/admin/events', t('admin.stats.upcomingEvents'), data.upcomingEvents],
        ['/admin/notices', t('admin.stats.notices'), data.notices],
        ['/admin/gallery', t('admin.stats.albums'), data.albums],
        ['/admin/media', t('admin.stats.media'), data.media],
        ['/admin/videos', t('admin.stats.videos'), data.videos],
        ['/admin/committee', t('admin.stats.committee'), data.committee],
        ['/admin/members', t('admin.stats.members'), data.members],
        ['/admin/inbox', t('admin.stats.unread'), data.unreadMessages],
        ['/admin/puja-schedule', t('admin.stats.schedule'), data.upcomingSchedule],
        ['/admin/memories', t('nav.memories'), data.memories],
        ['/admin/souvenir', t('nav.souvenir'), data.souvenirs],
      ]
    : [];

  const quick = [
    ['/admin/events?new=1', 'admin.quick.event'],
    ['/admin/notices?new=1', 'admin.quick.notice'],
    ['/admin/members?new=1', 'admin.quick.member'],
    ['/admin/committee?new=1', 'admin.quick.committee'],
    ['/admin/media', 'admin.quick.media'],
    ['/admin/puja-schedule', 'admin.quick.schedule'],
  ];

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>{t('admin.dashboard.welcome')}, {user?.name}</h1>
          <p>{t('admin.dashboard.subtitle')}</p>
          {data?.currentPuja && (
            <p>{t('admin.stats.currentPuja')}: <strong>{data.currentPuja.year}</strong></p>
          )}
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="stat-grid">
            {stats.map(([to, label, val]) => (
              <Link to={to} key={label + to} className="stat-card" style={{ color: 'inherit' }}>
                <div className="stat-num">{val}</div>
                <div className="stat-label">{label}</div>
              </Link>
            ))}
          </div>
          <SectionHead title={t('admin.quick.title')} />
          <div className="quick-actions">
            {quick.map(([to, key]) => (
              <Link key={key} to={to} className="btn btn-outline btn-sm">＋ {t(key)}</Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
