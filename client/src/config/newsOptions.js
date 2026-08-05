export const NEWS_CATEGORIES = [
  { value: 'gold_market', label: 'Gold market' },
  { value: 'silver_market', label: 'Silver market' },
  { value: 'industry', label: 'Industry' },
  { value: 'shop_update', label: 'Shop update' },
  { value: 'general', label: 'General' },
];

export const NEWS_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

/** Admin list filter — includes an "all statuses" option the API understands. */
export const NEWS_STATUS_FILTERS = [{ value: 'all', label: 'All statuses' }, ...NEWS_STATUSES];

export const NEWS_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ne', label: 'नेपाली (Nepali)' },
];

export const categoryLabel = (value) =>
  NEWS_CATEGORIES.find((c) => c.value === value)?.label ?? value;
