import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { MotifMark } from '../../components/ui';
import { LanguageSwitcher } from '../../components/layout/Header';

const NAV = [
  { group: 'admin.nav.overview', items: [['/admin', 'admin.nav.dashboard', '◈', true]] },
  {
    group: 'admin.nav.content',
    items: [
      ['/admin/homepage', 'admin.nav.homepage', '⌂'],
      ['/admin/puja', 'admin.nav.puja', '🪔'],
      ['/admin/puja-schedule', 'admin.nav.schedule', '🗓'],
      ['/admin/events', 'admin.nav.events', '🎪'],
      ['/admin/notices', 'admin.nav.notices', '📋'],
    ],
  },
  {
    group: 'admin.nav.media',
    items: [
      ['/admin/gallery', 'admin.nav.gallery', '🖼'],
      ['/admin/videos', 'admin.nav.videos', '🎬'],
      ['/admin/media', 'admin.nav.mediaLibrary', '❏'],
    ],
  },
  {
    group: 'admin.nav.community',
    items: [
      ['/admin/committee', 'admin.nav.committee', '👥'],
      ['/admin/members', 'admin.nav.members', '🪪'],
      ['/admin/social-activities', 'admin.nav.social', '🤝'],
      ['/admin/mansa-mandir', 'admin.nav.mandir', '🛕'],
    ],
  },
  {
    group: 'admin.nav.archive',
    items: [
      ['/admin/history', 'admin.nav.history', '📜'],
      ['/admin/memories', 'admin.nav.memories', '📷'],
      ['/admin/souvenir', 'admin.nav.souvenir', '📖'],
    ],
  },
  { group: 'admin.nav.communication', items: [['/admin/inbox', 'admin.nav.inbox', '✉']] },
  {
    group: 'admin.nav.system',
    items: [
      ['/admin/settings', 'admin.nav.settings', '⚙'],
      ['/admin/profile', 'admin.nav.profile', '🔒'],
    ],
  },
];

export default function AdminLayout() {
  const { t, L } = useLanguage();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 860);

  const doLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Admin navigation">
        <div className="admin-side-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MotifMark width={26} height={26} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {settings ? L(settings.clubName) : 'GMMC'}
          </span>
        </div>
        {NAV.map((section) => (
          <div className="admin-nav-group" key={section.group}>
            <div className="group-label">{t(section.group)}</div>
            {section.items.map(([to, key, icon, end]) => (
              <NavLink key={to} to={to} end={Boolean(end)}>
                <span aria-hidden="true">{icon}</span> {t(key)}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="admin-nav-group" style={{ marginBottom: 30 }}>
          <NavLink to="/" target="_blank" rel="noopener noreferrer">
            <span aria-hidden="true">↗</span> {t('admin.nav.viewSite')}
          </NavLink>
        </div>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <button type="button" className="icon-btn" onClick={() => setCollapsed((c) => !c)} aria-label="Toggle sidebar">☰</button>
          <div style={{ flex: 1 }} />
          <LanguageSwitcher />
          <span className="badge-dot text-muted2" title={user?.email}>{user?.name}</span>
          <button type="button" className="btn btn-light btn-sm" onClick={doLogout}>{t('admin.logout')}</button>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
