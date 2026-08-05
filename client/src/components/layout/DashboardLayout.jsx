import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = [
  { match: /^\/admin\/news\/new$/, title: 'Write an article' },
  { match: /^\/admin\/news\/[^/]+\/edit$/, title: 'Edit article' },
  { match: /^\/admin\/news/, title: 'News & updates' },
  { match: /^\/admin\/rates/, title: 'Metal rates' },
  { match: /^\/admin\/?$/, title: 'Dashboard' },
];

/** Sidebar + topbar shell for every authenticated admin screen. */
export default function DashboardLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  const title = TITLES.find((t) => t.match.test(pathname))?.title ?? 'Admin';

  return (
    <div className="min-h-screen bg-forest-900">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="lg:pl-[17rem]">
        <Topbar title={title} onOpenNav={() => setNavOpen(true)} />

        <main className="px-6 py-8 lg:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
