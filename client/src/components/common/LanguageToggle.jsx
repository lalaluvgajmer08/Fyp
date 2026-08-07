import { useLanguage } from '../../context/LanguageContext';
import { cn } from '../../utils/cn';

const OPTIONS = [
  { value: 'en', label: 'EN', title: 'English' },
  { value: 'ne', label: 'नेपाली', title: 'Nepali' },
];

/**
 * Two-segment language switch. Both options are always visible so a Nepali
 * reader can find their language without first understanding the English label
 * — a single-button toggle would hide whichever language you cannot read.
 */
export default function LanguageToggle({ className }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        'inline-flex items-center ring-1 ring-inset ring-cream-200/30',
        className
      )}
    >
      {OPTIONS.map((option) => {
        const active = lang === option.value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            title={option.title}
            aria-pressed={active}
            onClick={() => setLang(option.value)}
            className={cn(
              'px-3 py-1.5 text-[0.8125rem] transition-colors',
              active
                ? 'bg-gold-500/15 text-gold-300'
                : 'text-cream-200 hover:text-gold-400'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
