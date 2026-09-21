import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PublicLayout() {
  const { t } = useLanguage();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a className="skip-link" href="#main-content">{t('nav.menu') === 'Menu' ? 'Skip to content' : 'মূল বিষয়বস্তুতে যান'}</a>
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
