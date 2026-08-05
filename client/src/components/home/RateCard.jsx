import { ArrowUpIcon, ArrowDownIcon } from '../common/icons';
import { formatNPR, formatPercent, tolaToTenGram } from '../../utils/formatters';
import { cn } from '../../utils/cn';

/** One metal's current rate, with the day's movement. */
export default function RateCard({ rate }) {
  const { label, purityLabel, ratePerTola, changeAmount, changePercent } = rate;

  const up = Number(changeAmount) > 0;
  const down = Number(changeAmount) < 0;
  const tenGram = tolaToTenGram(ratePerTola);

  return (
    <article className="group border border-cream-200/12 bg-forest-850/60 p-7 transition-colors duration-300 hover:border-gold-400/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.375rem] font-normal text-cream-50">{label}</h3>
          <p className="eyebrow mt-1.5 text-muted-400">{purityLabel}</p>
        </div>

        {(up || down) && (
          <span
            className={cn(
              'numeric inline-flex items-center gap-1 px-2 py-1 text-xs',
              up ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
            )}
          >
            {up ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {formatPercent(changePercent)}
          </span>
        )}
      </div>

      <dl className="mt-7 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-sm text-muted-400">Per tola</dt>
          <dd className="numeric font-display text-[1.75rem] leading-none text-gold-400">
            {formatNPR(ratePerTola)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-cream-200/10 pt-3">
          <dt className="text-sm text-muted-400">Per 10 grams</dt>
          <dd className="numeric text-base text-cream-200">{formatNPR(tenGram)}</dd>
        </div>
      </dl>
    </article>
  );
}
