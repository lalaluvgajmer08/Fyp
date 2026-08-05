const TOLA_IN_GRAMS = 11.6638;

/** NPR amount, no decimals — matches how rates are quoted in Nepal. */
export const formatNPR = (value, { withSymbol = true } = {}) => {
  if (value == null || Number.isNaN(Number(value))) return '—';

  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(Number(value));

  return withSymbol ? `Rs ${formatted}` : formatted;
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

/** "Tuesday, August 4, 2026" */
export const formatLongDate = (date = new Date(), locale = 'en-US') =>
  new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));

export { TOLA_IN_GRAMS };
