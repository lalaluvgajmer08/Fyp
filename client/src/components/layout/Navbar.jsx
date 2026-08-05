import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Container from '../common/Container';
import { BagIcon, MenuIcon, CloseIcon } from '../common/icons';
import { NAV_LINKS, SHOP } from '../../config/site';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function Navbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  const isStaff = user?.role === 'admin' || user?.role === 'staff';

  // Solid background once the hero starts scrolling under the bar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent background scrolling while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close the drawer on Escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const linkClass = ({ isActive }) =>
    cn(
      'relative py-2 text-[0.9375rem] transition-colors duration-200',
      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left',
      'after:scale-x-0 after:bg-gold-400 after:transition-transform after:duration-300',
      'hover:after:scale-x-100',
      isActive ? 'text-gold-400 after:scale-x-100' : 'text-cream-200 hover:text-cream-50'
    );

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled || open
          ? 'bg-forest-950/95 backdrop-blur-md border-b border-cream-200/10'
          : 'bg-forest-950/70 backdrop-blur-sm'
      )}
    >
      <Container>
        <div className="flex h-[4.75rem] items-center justify-between gap-6">
          {/* Brand */}
          <Link
            to="/"
            className="font-display text-[1.5rem] font-normal tracking-wide text-gold-400 transition-opacity hover:opacity-85 sm:text-[1.625rem]"
          >
            {SHOP.name}
          </Link>

          {/* Desktop nav — centred */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={linkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {/* Staff get a way into the console; everyone else gets a sign-in link.
                Without this the admin area is only reachable by typing the URL. */}
            {isStaff ? (
              <Link
                to="/admin"
                className="hidden text-[0.9375rem] text-cream-200 transition-colors hover:text-gold-400 sm:inline"
              >
                Console
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden text-[0.9375rem] text-cream-200 transition-colors hover:text-gold-400 sm:inline"
              >
                Sign in
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="hidden items-center gap-2.5 px-5 py-2.5 text-[0.9375rem] text-cream-50 ring-1 ring-inset ring-cream-200/30 transition-colors hover:text-gold-400 hover:ring-gold-400/60 sm:inline-flex"
            >
              <BagIcon />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="numeric ml-0.5 rounded-full bg-gold-500 px-1.5 text-xs font-medium text-forest-950">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="p-2 text-cream-50 transition-colors hover:text-gold-400 lg:hidden"
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-cream-200/10 bg-forest-950 lg:hidden"
      >
        <Container>
          <nav aria-label="Mobile" className="py-6">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.to} className="border-b border-cream-200/8 last:border-0">
                  <NavLink
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'block py-4 text-lg transition-colors',
                        isActive ? 'text-gold-400' : 'text-cream-200 hover:text-cream-50'
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}

              <li className="border-t border-cream-200/8">
                <NavLink
                  to={isStaff ? '/admin' : '/login'}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-lg text-cream-200 transition-colors hover:text-cream-50"
                >
                  {isStaff ? 'Console' : 'Sign in'}
                </NavLink>
              </li>
            </ul>

            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex items-center gap-2.5 px-5 py-3 text-cream-50 ring-1 ring-inset ring-cream-200/30 sm:hidden"
            >
              <BagIcon />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </nav>
        </Container>
      </div>
    </header>
  );
}
