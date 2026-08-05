/** Inline SVG icon set — avoids an icon dependency for a handful of glyphs. */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

export const BagIcon = ({ className = 'size-[1.125rem]' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M6 2 4 6v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6l-2-4H6Z" />
    <path d="M4 6h16" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const MenuIcon = ({ className = 'size-6' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ className = 'size-6' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ArrowUpIcon = ({ className = 'size-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = ({ className = 'size-3.5' }) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
