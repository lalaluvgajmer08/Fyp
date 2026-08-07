import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from '../../context/LanguageContext';

/** Shared shell: fixed navbar, routed page content, footer. */
export default function RootLayout() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-forest-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-forest-950"
      >
        {t('Skip to content')}
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
