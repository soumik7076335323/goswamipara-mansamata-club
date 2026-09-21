import { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Sets document title, meta description and Open Graph tags per page. */
export default function Seo({ title, description, image }) {
  const { lang, L } = useLanguage();
  const { settings } = useSettings();

  useEffect(() => {
    const suffix = settings ? L(settings.seo?.siteSuffix, '') : '';
    const fullTitle = title ? `${title} | ${suffix}` : suffix;
    if (fullTitle) document.title = fullTitle;
    const desc = description || (settings ? L(settings.seo?.metaDescription) : '');
    if (desc) {
      upsertMeta('name', 'description', desc);
      upsertMeta('property', 'og:description', desc);
    }
    if (fullTitle) upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:type', 'website');
    const img = image || settings?.seo?.ogImage;
    if (img) upsertMeta('property', 'og:image', img.startsWith('http') ? img : `${window.location.origin}${img}`);
    upsertMeta('property', 'og:locale', lang === 'bn' ? 'bn_IN' : 'en_IN');
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href.split('#')[0]);
  }, [title, description, image, lang, settings, L]);

  return null;
}
