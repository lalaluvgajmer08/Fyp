import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import NE from '../i18n/ne';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'jms.language';
const SUPPORTED = ['en', 'ne'];

/** Fills {name} placeholders so counts and names can sit inside a translated
 *  sentence instead of being concatenated around it. */
const interpolate = (template, vars) => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match
  );
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : 'en';
  });

  // Persist to the key api.js already reads for Accept-Language, and set the
  // document language so the :lang(ne) font rule in index.css activates.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Keys are the English source strings, so a missing entry falls back to
  // readable English rather than exposing a raw key to a customer.
  const t = useCallback(
    (text, vars) => {
      if (text == null) return '';
      const translated = lang === 'ne' ? NE[text] ?? text : text;
      return interpolate(translated, vars);
    },
    [lang]
  );

  // Config option lists keep English `label`s because their sibling `value` is
  // the API contract. Translation happens here, at render time.
  const tOptions = useCallback(
    (options = []) => options.map((o) => ({ ...o, label: t(o.label) })),
    [t]
  );

  const value = useMemo(
    () => ({
      lang,
      isNepali: lang === 'ne',
      setLang: (next) => SUPPORTED.includes(next) && setLang(next),
      toggle: () => setLang((prev) => (prev === 'en' ? 'ne' : 'en')),
      t,
      tOptions,
    }),
    [lang, t, tOptions]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
