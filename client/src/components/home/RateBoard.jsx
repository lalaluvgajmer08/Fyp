import Container from '../common/Container';
import SectionHeading from '../common/SectionHeading';
import RateCard from './RateCard';
import Button from '../common/Button';
import useTodayRates from '../../hooks/useTodayRates';
import useFormat from '../../hooks/useFormat';
import { useLanguage } from '../../context/LanguageContext';

function RateCardSkeleton() {
  return (
    <div className="border border-cream-200/12 bg-forest-850/60 p-7">
      <div className="animate-pulse space-y-6">
        <div className="h-6 w-32 bg-cream-200/10" />
        <div className="h-8 w-40 bg-cream-200/10" />
        <div className="h-4 w-24 bg-cream-200/10" />
      </div>
    </div>
  );
}

/**
 * Today's rate cards. Used on the home page and at the top of /rates —
 * `showHistoryLink` is off there so the page does not link to itself.
 */
export default function RateBoard({ showHistoryLink = true }) {
  const { rates, isLive, loading, updatedAt } = useTodayRates();
  const { t } = useLanguage();
  const { formatLongDate } = useFormat();

  return (
    <section aria-labelledby="rates-heading" className="bg-forest-850 py-20 lg:py-24">
      <Container>
        <SectionHeading
          id="rates-heading"
          eyebrow={t("Today's metal rates")}
          title={t('Live valuation board')}
          aside={
            <span className="text-gold-300/80">
              {t('Updated {date}', { date: formatLongDate(updatedAt ?? new Date()) })}
            </span>
          }
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <RateCardSkeleton key={i} />)
            : rates.map((rate) => <RateCard key={rate._id ?? rate.category} rate={rate} />)}
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-cream-200/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-400">
            {isLive ? (
              t('Rates follow the daily FENEGOSIDA publication and are applied to every quotation and invoice.')
            ) : (
              <>
                <span className="text-gold-300">{t('Indicative figures.')}</span>{' '}
                {t('The live rate service is not connected yet — these values are for layout preview only.')}
              </>
            )}
          </p>

          {showHistoryLink && (
            <Button to="/rates" variant="outline" size="md" className="shrink-0">
              {t('View rate history')}
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
