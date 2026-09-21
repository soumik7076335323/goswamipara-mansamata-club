import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { NAV_ROUTES, LanguageSwitcher } from './Header';
import { MotifMark } from '../ui';

export default function Footer() {
  const { t, L } = useLanguage();
  const { settings } = useSettings();
  const year = new Date().getFullYear();
  const name = settings ? L(settings.clubName, 'গোস্বামীপাড়া মনসামাতা ক্লাব') : 'গোস্বামীপাড়া মনসামাতা ক্লাব';

  return (
    <footer className="site-footer">
      <div className="footer-crest">
        <div className="container">
          <MotifMark width={44} height={44} opacity={0.9} />
          <div>
            <h2>{name}</h2>
            <div className="est">
              {settings?.establishedYear ? `${t('common.established')} — ${settings.establishedYear}` : ''}
              {settings?.registrationNumber ? ` · ${t('common.registrationNo')}: ${settings.registrationNumber}` : ''}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{name}</h4>
            {settings?.footerText && (settings.footerText.bn || settings.footerText.en) ? (
              <p style={{ fontSize: '0.9rem' }}>{L(settings.footerText)}</p>
            ) : (
              <p style={{ fontSize: '0.9rem' }}>{t('home.identity.text')}</p>
            )}
            <div className="mt-2"><LanguageSwitcher /></div>
            {settings?.socialLinks?.length > 0 && (
              <div className="tag-list mt-2">
                {settings.socialLinks.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="chip chip-gold" style={{ display: 'inline-block' }}>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4>{t('footer.quickLinks')}</h4>
            {['nav.about', 'nav.durgaPuja', 'nav.events', 'nav.gallery', 'nav.contact'].map((k) => (
              <Link key={k} to={NAV_ROUTES[k]}>{t(k)}</Link>
            ))}
          </div>
          <div>
            <h4>{t('footer.explore')}</h4>
            {['nav.mansaMandir', 'nav.committee', 'nav.members', 'nav.souvenir', 'nav.memories', 'nav.notices'].map((k) => (
              <Link key={k} to={NAV_ROUTES[k]}>{t(k)}</Link>
            ))}
          </div>
          <div>
            <h4>{t('footer.contact')}</h4>
            <div className="footer-address">{settings ? L(settings.address) : ''}</div>
            {settings?.contactEmail && (
              <div className="mt-2" style={{ fontSize: '0.9rem' }}>
                <a href={`mailto:${settings.contactEmail}`} style={{ display: 'inline' }}>{settings.contactEmail}</a>
              </div>
            )}
            {settings?.contactPhone && (
              <div style={{ fontSize: '0.9rem' }}>
                <a href={`tel:${settings.contactPhone}`} style={{ display: 'inline' }}>{settings.contactPhone}</a>
              </div>
            )}
            {settings?.mapUrl && (
              <a className="btn btn-outline btn-sm mt-2" style={{ color: '#f2d9a0', borderColor: 'rgba(242,217,160,0.5)' }} href={settings.mapUrl} target="_blank" rel="noopener noreferrer">
                ⌖ {t('common.viewOnGoogleMaps')}
              </a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} {name}. {t('footer.copyright')}</span>
          <span className="reg-note">{settings?.registrationNumber || ''}</span>
        </div>
      </div>
    </footer>
  );
}
