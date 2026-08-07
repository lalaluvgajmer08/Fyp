const TOLA_IN_GRAMS = 11.6638;

// Latin digits are kept in Nepali mode: the .numeric tabular-figures rule that
// aligns the rate board only works with Latin numerals, and Nepali commercial
// sites overwhelmingly quote prices this way. Only the currency symbol changes.
// Switching to Devanagari digits later means using 'ne-NP-u-nu-deva' here.
const NUMBER_LOCALE = 'en-IN';

const DATE_LOCALES = {
  en: 'en-US',
  ne: 'ne-NP-u-nu-latn',
};

const CURRENCY_SYMBOLS = {
  en: 'Rs',
  ne: 'रु',
};

/** NPR amount, no decimals — matches how rates are quoted in Nepal. */
export const formatNPR = (value, { withSymbol = true } = {}, lang = 'en') => {
  if (value == null || Number.isNaN(Number(value))) return '—';

  const formatted = new Intl.NumberFormat(NUMBER_LOCALE, {
    maximumFractionDigits: 0,
  }).format(Number(value));

  if (!withSymbol) return formatted;
  return `${CURRENCY_SYMBOLS[lang] ?? CURRENCY_SYMBOLS.en} ${formatted}`;
};

/** Converts a per-tola rate to per 10 grams. */
export const tolaToTenGram = (ratePerTola) =>
  ratePerTola == null ? null : (Number(ratePerTola) / TOLA_IN_GRAMS) * 10;

/** Signed percentage, e.g. "+0.35%". */
export const formatPercent = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`;
};

/**
 * "Tuesday, August 4, 2026" in English; Nepali month and weekday names with
 * Latin numerals in Nepali. Still the Gregorian calendar — Intl cannot produce
 * Bikram Sambat, so BS conversion would need a separate library.
 */
export const formatLongDate = (date = new Date(), lang = 'en') =>
  new Intl.DateTimeFormat(DATE_LOCALES[lang] ?? DATE_LOCALES.en, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));

/** "04/08/2026" — compact form for admin tables and rate rows. */
export const formatShortDate = (date, lang = 'en') => {
  if (!date) return '—';
  return new Intl.DateTimeFormat(lang === 'ne' ? 'ne-NP-u-nu-latn' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

export { TOLA_IN_GRAMS };
