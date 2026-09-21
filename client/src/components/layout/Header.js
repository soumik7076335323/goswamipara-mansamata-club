import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { MotifMark } from '../ui';

const PRIMARY_NAV = ['nav.home', 'nav.about', 'nav.durgaPuja', 'nav.events', 'nav.gallery', 'nav.contact'];
const MORE_NAV = ['nav.notices', 'nav.videos', 'nav.committee', 'nav.members', 'nav.socialActivities', 'nav.mansaMandir', 'nav.memories', 'nav.souvenir'];

export const NAV_ROUTES = {
  'nav.home': '/',
  'nav.about': '/about',
  'nav.durgaPuja': '/durga-puja',
  'nav.events': '/events',
  'nav.notices': '/notices',
  'nav.gallery': '/gallery',
  'nav.videos': '/videos',
  'nav.committee': '/committee',
  'nav.members': '/members',
  'nav.socialActivities': '/social-activities',
  'nav.mansaMandir': '/mansa-mandir',
  'nav.memories': '/memories',
  'nav.souvenir': '/souvenir',
  'nav.contact': '/contact',
};

export function LanguageSwitcher({ compact }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button type="button" className={lang === 'bn' ? 'active' : ''} onClick={() => setLang('bn')} aria-pressed={lang === 'bn'}>
        বাংলা
      </button>
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
        EN
      </button>
    </div>
  );
}

export default function Header() {
  const { t, L } = useLanguage();
  const { settings } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const clubName = settings ? L(settings.clubName) : 'গোস্বামীপাড়া মনসামাতা ক্লাব';

  return (
    <>
      <div className="site-topbar">
        <div className="container">
          <span>
            {settings?.registrationNumber ? `${t('common.registrationNo')}: ${settings.registrationNumber}` : ''}
          </span>
          <span className="flex gap-2" style={{ alignItems: 'center' }}>
            {settings?.establishedYear ? `${t('common.established')} — ${settings.establishedYear}` : ''}
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand" aria-label={clubName}>
            <span className="brand-logo">
              {settings?.logo ? (
                <img src={settings.logo} alt="" width="46" height="46" />
              ) : (
                <MotifMark width={30} height={30} />
              )}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="brand-name" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {clubName}
              </span>
              <span className="brand-sub">{t('nav.durgaPuja')} · Ramnagar, Tarakeswar</span>
            </span>
          </Link>
          <nav className="main-nav" aria-label="Primary">
            {PRIMARY_NAV.map((key) => (
              <NavLink key={key} to={NAV_ROUTES[key]} end={key === 'nav.home'}>
                {t(key)}
              </NavLink>
            ))}
            <div className="nav-more-wrap" ref={moreRef}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-haspopup="true"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
              >
                {t('nav.more')} ▾
              </button>
              <div className={`nav-more-menu ${moreOpen ? 'open' : ''}`}>
                {MORE_NAV.map((key) => (
                  <NavLink key={key} to={NAV_ROUTES[key]}>
                    {t(key)}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
          <LanguageSwitcher />
          <button
            type="button"
            className="nav-toggle"
            aria-label={mobileOpen ? t('nav.close') : t('nav.menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
        <nav className={`mobile-menu ${mobileOpen ? 'open' : ''}`} aria-label="Mobile">
          {[...PRIMARY_NAV, ...MORE_NAV].map((key) => (
            <NavLink key={key} to={NAV_ROUTES[key]} end={key === 'nav.home'}>
              {t(key)}
            </NavLink>
          ))}
        </nav>
      </header>
    </>
  );
}
