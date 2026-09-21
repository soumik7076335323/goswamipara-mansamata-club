import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'gmmc_lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'en' || saved === 'bn' ? saved : 'bn';
    } catch {
      return 'bn';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* private mode */
    }
    document.documentElement.lang = lang;
    document.title =
      lang === 'bn'
        ? 'গোস্বামীপাড়া মনসামাতা ক্লাব | Goswamipara Mansa Mata Club'
        : 'Goswamipara Mansa Mata Club | গোস্বামীপাড়া মনসামাতা ক্লাব';
  }, [lang]);

  const t = useCallback(
    (key, fallback) => {
      const entry = translations[key];
      if (!entry) return fallback !== undefined ? fallback : key;
      return entry[lang] || entry.bn || entry.en || fallback || key;
    },
    [lang]
  );

  /** Resolve a bilingual {bn,en} field with graceful fallback. */
  const L = useCallback(
    (field, fallback = '') => {
      if (field === null || field === undefined) return fallback;
      if (typeof field === 'string' || typeof field === 'number') return String(field);
      if (typeof field === 'object') {
        const val = field[lang] || field.bn || field.en;
        return val === undefined || val === null ? fallback : String(val);
      }
      return fallback;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, L, isBn: lang === 'bn' }),
    [lang, t, L]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
