import { useState } from 'react';
import Container from '../components/common/Container';
import Eyebrow from '../components/common/Eyebrow';
import Button from '../components/common/Button';
import { Card, CardBody, CardHeader } from '../components/common/Card';
import { Input, Select } from '../components/common/Input';
import useTodayRates from '../hooks/useTodayRates';
import useFormat from '../hooks/useFormat';
import { useLanguage } from '../context/LanguageContext';
import { puritiesForMetal, PRODUCT_METALS } from '../config/productOptions';
import { TOLA_IN_GRAMS } from '../utils/formatters';
import { SHOP } from '../config/site';

/**
 * Exchanging a used piece is valued on metal alone.
 *
 * When the shop sells a piece, the customer pays for metal PLUS the making
 * charge — the labour of turning bullion into jewellery. When that piece comes
 * back, the shop cannot resell the labour: the item is melted down and returns
 * to raw metal. So the making charge the customer originally paid is simply not
 * recoverable, and the buy-back quote is based on the metal content only.
 *
 * On top of that, melting and refining physically loses a little metal, and the
 * assayed purity of an old piece is usually a shade below its stamp. That is
 * what this deduction covers. It is applied to the metal value, never to the
 * original making charge — that labour is already gone from the calculation.
 */
const REFINING_DEDUCTION = 0.12;

const STEPS = [
  {
    title: 'Bring the piece in',
    body: 'No appointment needed. Bring the jewellery and, if you have it, the original bill or hallmark certificate.',
  },
  {
    title: 'Purity tested in front of you',
    body: 'The piece is tested on an XRF machine at the counter. You see the reading as it happens — nothing is taken out of sight.',
  },
  {
    title: 'Weighed and valued on metal',
    body: 'Net metal weight is taken on a calibrated scale and valued at the day’s published rate. Making charge is not part of a buy-back — the piece is melted, so the original labour cannot be resold.',
  },
  {
    title: 'Applied against a purchase',
    body: 'The quoted value comes straight off the price of the new piece. Any balance is settled at the counter.',
  },
];

export default function Exchange() {
  const { rates, isLive, updatedAt } = useTodayRates();
  const { t, tOptions } = useLanguage();
  const { formatNPR, formatLongDate } = useFormat();

  const [metal, setMetal] = useState('gold');
  const [purity, setPurity] = useState('HALLMARK_GOLD');
  const [weight, setWeight] = useState('');

  const handleMetal = (e) => {
    const value = e.target.value;
    setMetal(value);

    // Switching metal invalidates the purity — snap to the first valid one
    const options = puritiesForMetal(value);
    if (!options.some((o) => o.value === purity)) {
      setPurity(options[0]?.value ?? '');
    }
  };

  // Only quote against a genuinely published rate. The rates hook falls back to
  // indicative figures for layout, and quoting money off those would mislead.
  const rate = isLive ? rates.find((r) => r.category === purity) : null;
  const grams = Number(weight);
  const hasWeight = weight !== '' && Number.isFinite(grams) && grams > 0;

  const ratePerGram = rate ? rate.ratePerTola / TOLA_IN_GRAMS : null;
  const metalValue = ratePerGram != null && hasWeight ? ratePerGram * grams : null;
  const deduction = metalValue == null ? null : metalValue * REFINING_DEDUCTION;
  const payable = metalValue == null ? null : metalValue - deduction;

  return (
    <div className="bg-forest-900 py-32">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow className="mb-5">{t('Old gold exchange')}</Eyebrow>
          <h1 className="font-display text-[2.75rem] font-light leading-tight text-cream-50 sm:text-[3.5rem]">
            {t('Bring in your older jewellery')}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-400">
            {t(
              "Older pieces can be exchanged against anything in the collection. Purity is tested at the counter, the metal is weighed, and the value is applied to your new piece at the day's rate."
            )}
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Estimator */}
          <Card>
            <CardHeader
              title={t('Estimate your exchange')}
              subtitle={t('An indication only — the counter quote is set after testing')}
            />
            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label={t('Metal')}
                  value={metal}
                  onChange={handleMetal}
                  options={tOptions(PRODUCT_METALS)}
                />
                <Select
                  label={t('Purity')}
                  value={purity}
                  onChange={(e) => setPurity(e.target.value)}
                  options={tOptions(puritiesForMetal(metal))}
                />
              </div>

              <Input
                label={t('Weight (g)')}
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="12.50"
                hint={t('Metal weight only. Stones and enamel are deducted at the counter.')}
              />

              <div className="border border-gold-400/25 bg-gold-500/[0.06] p-6">
                {!rate ? (
                  <p className="text-sm leading-relaxed text-muted-400">
                    {t('No rate has been published for this purity yet, so an estimate cannot be shown. Call the shop on {phone} for a current quotation.', {
                      phone: SHOP.phone,
                    })}
                  </p>
                ) : !hasWeight ? (
                  <p className="text-sm leading-relaxed text-muted-400">
                    {t("Enter the weight to see what the piece is worth against today's {rate} per tola rate.", {
                      rate: formatNPR(rate.ratePerTola),
                    })}
                  </p>
                ) : (
                  <>
                    <p className="eyebrow text-gold-400/90">{t('Indicative exchange value')}</p>
                    <p className="numeric mt-2 font-display text-[2.5rem] leading-none text-cream-50">
                      {formatNPR(payable)}
                    </p>

                    <dl className="mt-5 space-y-2 border-t border-gold-400/20 pt-4 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-400">
                          {t('Metal value · {weight}g at {rate}/g', {
                            weight: grams,
                            rate: formatNPR(ratePerGram),
                          })}
                        </dt>
                        <dd className="numeric text-cream-200">{formatNPR(metalValue)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-400">
                          {t('Refining deduction · {percent}%', {
                            percent: Math.round(REFINING_DEDUCTION * 100),
                          })}
                        </dt>
                        <dd className="numeric text-cream-200">&minus;{formatNPR(deduction)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-400">{t('Making charge recovered')}</dt>
                        <dd className="numeric text-muted-400">{t('None')}</dd>
                      </div>
                    </dl>

                    <p className="mt-4 border-t border-gold-400/20 pt-4 text-xs leading-relaxed text-muted-400/90">
                      {t(
                        'A buy-back pays for metal only. The making charge on the original purchase covered the labour of shaping the piece, and melting it down returns it to raw metal — so that labour cannot be paid back a second time.'
                      )}
                    </p>
                  </>
                )}
              </div>

              <p className="text-xs leading-relaxed text-muted-400/80">
                {isLive && updatedAt
                  ? t('Based on the rate published {date}. The metal rate moves daily and the deduction depends on the condition of the piece, so the final figure is confirmed at the counter.', {
                      date: formatLongDate(updatedAt),
                    })
                  : t('The metal rate moves daily and the deduction depends on the condition of the piece, so the final figure is confirmed at the counter.')}
              </p>
            </CardBody>
          </Card>

          {/* How it works */}
          <div>
            <h2 className="font-display text-2xl font-light text-cream-50">{t('How it works')}</h2>

            <ol className="mt-8 space-y-8">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="numeric flex size-9 shrink-0 items-center justify-center border border-gold-400/30 text-sm text-gold-300"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-cream-50">{t(step.title)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-400">{t(step.body)}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 border-t border-cream-200/10 pt-8">
              <p className="text-sm leading-relaxed text-muted-400">
                {t('Exchanges are handled in person at the showroom, {address}. Open {hours}.', {
                  address: t(SHOP.address),
                  hours: t(SHOP.hours),
                })}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/visit" variant="primary" size="lg">
                  {t('Plan your visit')}
                </Button>
                <Button to="/collection" variant="outline" size="lg">
                  {t('Browse the collection')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
