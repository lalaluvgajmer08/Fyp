import { Link } from 'react-router-dom';
import Container from '../common/Container';
import { NAV_LINKS, SHOP } from '../../config/site';

export default function Footer() {
  return (
    <footer className="border-t border-cream-200/10 bg-forest-950">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <p className="font-display text-2xl text-gold-400">{SHOP.name}</p>
            <p className="max-w-xs text-sm leading-relaxed text-muted-400">
              Hand-finished gold, diamond and platinum pieces, priced transparently against the
              day&apos;s metal rates.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="eyebrow mb-4 text-cream-200">Explore</h2>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-400 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow mb-4 text-cream-200">Visit</h2>
            <address className="space-y-2.5 text-sm not-italic text-muted-400">
              <p>{SHOP.address}</p>
              <p>
                <a href={`tel:${SHOP.phone.replace(/\s/g, '')}`} className="hover:text-gold-400">
                  {SHOP.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${SHOP.email}`} className="hover:text-gold-400">
                  {SHOP.email}
                </a>
              </p>
              <p>{SHOP.hours}</p>
            </address>
          </div>
        </div>

        <div className="mt-12 border-t border-cream-200/10 pt-6 text-xs text-muted-400">
          <p>
            © {new Date().getFullYear()} {SHOP.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
