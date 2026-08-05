import { NavLink, Link } from 'react-router-dom';
import { CloseIcon } from '../common/icons';
import { SHOP } from '../../config/site';
import { cn } from '../../utils/cn';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', end: true }],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/news', label: 'News & updates' },
      { to: '/admin/news/new', label: 'Write an article' },
      { to: '/admin/products', label: 'Products' },
      { to: '/admin/products/new', label: 'Add a product' },
      { to: '/admin/rates', label: 'Metal rates' },
    ],
  },
  {
    label: 'Coming soon',
    items: [
      { to: '/admin/inventory', label: 'Inventory', disabled: true },
      { to: '/admin/orders', label: 'Orders', disabled: true },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const linkClass = ({ isActive }) =>
    cn(
      'block px-4 py-2.5 text-sm transition-colors',
      isActive
        ? 'bg-gold-500/12 text-gold-300 ring-1 ring-inset ring-gold-400/25'
        : 'text-cream-200 hover:bg-cream-200/5 hover:text-cream-50'
    );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-forest-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-cream-200/10 bg-forest-950',
          'transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Admin navigation"
      >
        <div className="flex h-[4.75rem] shrink-0 items-center justify-between border-b border-cream-200/10 px-6">
          <Link to="/" className="font-display text-xl text-gold-400">
            {SHOP.name}
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="p-1 text-muted-400 hover:text-cream-50 lg:hidden"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-7">
              <p className="eyebrow px-4 pb-2.5 text-muted-400/70">{section.label}</p>

              <ul className="space-y-0.5">
                {section.items.map((item) =>
                  item.disabled ? (
                    <li key={item.to}>
                      <span
                        aria-disabled="true"
                        title="Not built yet"
                        className="block cursor-not-allowed px-4 py-2.5 text-sm text-muted-400/45"
                      >
                        {item.label}
                      </span>
                    </li>
                  ) : (
                    <li key={item.to}>
                      <NavLink to={item.to} end={item.end} className={linkClass} onClick={onClose}>
                        {item.label}
                      </NavLink>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-cream-200/10 px-6 py-4">
          <Link to="/" className="text-xs text-muted-400 transition-colors hover:text-gold-400">
            ← Back to storefront
          </Link>
        </div>
      </aside>
    </>
  );
}
