import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  formatNPR as baseFormatNPR,
  formatLongDate as baseFormatLongDate,
  formatShortDate as baseFormatShortDate,
  formatPercent,
  tolaToTenGram,
  TOLA_IN_GRAMS,
} from '../utils/formatters';

/**
 * Formatters bound to the active language, so call sites don't thread `lang`
 * through manually. formatPercent is language-independent but is returned here
 * too, so a component only needs one import for all money/date/percent output.
 */
export default function useFormat() {
  const { lang } = useLanguage();

  const formatNPR = useCallback(
    (value, options) => baseFormatNPR(value, options, lang),
    [lang]
  );

  const formatLongDate = useCallback((date) => baseFormatLongDate(date, lang), [lang]);

  const formatShortDate = useCallback((date) => baseFormatShortDate(date, lang), [lang]);

  return {
    formatNPR,
    formatLongDate,
    formatShortDate,
    formatPercent,
    tolaToTenGram,
    TOLA_IN_GRAMS,
  };
}
