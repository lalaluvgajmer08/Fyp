import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

const base =
  'inline-flex items-center justify-center gap-2 font-sans text-[0.9375rem] font-normal ' +
  'transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-gold-500 text-forest-950 hover:bg-gold-400',
  secondary: 'bg-forest-800/80 text-cream-50 ring-1 ring-inset ring-cream-200/25 hover:bg-forest-700',
  ghost: 'text-cream-200 hover:text-gold-400',
  outline: 'text-cream-50 ring-1 ring-inset ring-cream-200/30 hover:ring-gold-400 hover:text-gold-400',
};

const sizes = {
  sm: 'h-10 px-4',
  md: 'h-12 px-6',
  lg: 'h-[3.25rem] px-8',
};

/**
 * Renders as <button>, <a> or react-router <Link> depending on props,
 * so navigation stays semantic instead of using onClick handlers.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className,
  children,
  ...rest
}) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
