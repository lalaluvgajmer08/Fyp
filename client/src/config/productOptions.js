export const PRODUCT_CATEGORIES = [
  { value: 'ring', label: 'Rings' },
  { value: 'necklace', label: 'Necklaces' },
  { value: 'bracelet', label: 'Bracelets & anklets' },
  { value: 'earring', label: 'Earrings' },
  { value: 'pendant', label: 'Pendants' },
  { value: 'chain', label: 'Chains' },
  { value: 'bangle', label: 'Bangles' },
  { value: 'set', label: 'Bridal sets' },
];

export const PRODUCT_METALS = [
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
];

/** Purity values mirror Rate.category — this is what ties a product to a rate. */
export const PRODUCT_PURITIES = [
  { value: 'FINE_GOLD_9999', label: 'Fine gold · 9999 · 24K', metal: 'gold' },
  { value: 'TEJABI_GOLD', label: 'Tejabi gold', metal: 'gold' },
  { value: 'HALLMARK_GOLD', label: 'Hallmark gold · 916 · 22K', metal: 'gold' },
  { value: 'SILVER', label: 'Fine silver', metal: 'silver' },
];

export const PRODUCT_STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'sold', label: 'Sold' },
  { value: 'discontinued', label: 'Discontinued' },
];

/** Admin list filter — includes an "all statuses" option the API understands. */
export const PRODUCT_STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  ...PRODUCT_STATUSES,
];

export const PRODUCT_SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'weight_asc', label: 'Weight: light to heavy' },
  { value: 'weight_desc', label: 'Weight: heavy to light' },
];

/** Only the purities that belong to the chosen metal. */
export const puritiesForMetal = (metal) =>
  PRODUCT_PURITIES.filter((p) => p.metal === metal).map(({ value, label }) => ({ value, label }));

export const categoryLabel = (value) =>
  PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export const purityLabel = (value) =>
  PRODUCT_PURITIES.find((p) => p.value === value)?.label ?? value;

/** Status → Badge tone, so the colour is consistent across every screen. */
export const PRODUCT_STATUS_TONE = {
  available: 'success',
  reserved: 'warning',
  sold: 'neutral',
  discontinued: 'danger',
};
