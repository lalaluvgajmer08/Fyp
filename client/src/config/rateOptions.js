/** The rate categories staff can publish, in board display order. */
export const RATE_CATEGORIES = [
  {
    value: 'FINE_GOLD_9999',
    label: 'Fine gold',
    metal: 'gold',
    purityLabel: '9999 · 24K',
  },
  {
    value: 'TEJABI_GOLD',
    label: 'Tejabi gold',
    metal: 'gold',
    purityLabel: 'Tejabi',
  },
  {
    value: 'HALLMARK_GOLD',
    label: 'Hallmark gold',
    metal: 'gold',
    purityLabel: '916 · 22K',
  },
  {
    value: 'SILVER',
    label: 'Silver',
    metal: 'silver',
    purityLabel: 'Fine silver',
  },
];

export const rateCategory = (value) => RATE_CATEGORIES.find((c) => c.value === value);

export const rateCategoryLabel = (value) => rateCategory(value)?.label ?? value;
