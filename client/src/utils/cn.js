/** Joins class names, dropping falsy values. */
export const cn = (...classes) => classes.filter(Boolean).join(' ');
