import { useState } from 'react';
import { MenuIcon } from '../common/icons';
import Button from '../common/Button';
import LanguageToggle from '../common/LanguageToggle';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Topbar({ title, onOpenNav }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    await logout();
    toast.success(t('Signed out'));
    setBusy(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[4.75rem] items-center justify-between gap-4 border-b border-cream-200/10 bg-forest-900/95 px-6 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label={t('Open navigation')}
          className="p-2 text-cream-50 hover:text-gold-400 lg:hidden"
        >
          <MenuIcon />
        </button>

        <h1 className="font-display text-xl font-normal text-cream-50 sm:text-2xl">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <LanguageToggle className="hidden sm:inline-flex" />

        <div className="hidden text-right sm:block">
          <p className="text-sm text-cream-50">{user?.name}</p>
          <p className="text-xs capitalize text-muted-400">{t(user?.role ?? '')}</p>
        </div>

        <div
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/15 font-display text-lg text-gold-300"
        >
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={busy}>
          {busy ? t('Signing out…') : t('Sign out')}
        </Button>
      </div>
    </header>
  );
}
