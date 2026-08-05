/**
 * Shown while the /rates endpoint does not exist yet.
 * Same shape the API will return, so swapping in live data needs no UI change.
 */
export const FALLBACK_RATES = [
  {
    _id: 'fallback-fine-gold',
    metal: 'gold',
    category: 'FINE_GOLD_9999',
    label: 'Fine gold',
    purityLabel: '9999 · 24K',
    ratePerTola: 285000,
    changeAmount: 1000,
    changePercent: 0.35,
    currency: 'NPR',
  },
  {
    _id: 'fallback-tejabi-gold',
    metal: 'gold',
    category: 'TEJABI_GOLD',
    label: 'Tejabi gold',
    purityLabel: 'Tejabi',
    ratePerTola: 283600,
    changeAmount: 950,
    changePercent: 0.34,
    currency: 'NPR',
  },
  {
    _id: 'fallback-silver',
    metal: 'silver',
    category: 'SILVER',
    label: 'Silver',
    purityLabel: 'Fine silver',
    ratePerTola: 3520,
    changeAmount: -15,
    changePercent: -0.42,
    currency: 'NPR',
  },
];
