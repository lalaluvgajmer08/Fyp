import Container from '../components/common/Container';
import Eyebrow from '../components/common/Eyebrow';
import { Card, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import { SHOP } from '../config/site';
import { useLanguage } from '../context/LanguageContext';

export default function VisitUs() {
  const { t } = useLanguage();

  const details = [
    { label: 'Address', value: t(SHOP.address) },
    { label: 'Telephone', value: SHOP.phone, href: `tel:${SHOP.phone.replace(/\s/g, '')}` },
    { label: 'Email', value: SHOP.email, href: `mailto:${SHOP.email}` },
    { label: 'Opening hours', value: t(SHOP.hours) },
  ];

  return (
    <div className="bg-forest-900 py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Left — intro */}
          <div>
            <Eyebrow className="mb-5">{t('Visit us')}</Eyebrow>
            <h1 className="font-display text-[2.75rem] font-light leading-tight text-cream-50 sm:text-[3.5rem]">
              {t('The showroom')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-400">
              {t(
                "Every piece in the catalogue is kept in the shop. Walk in to see the full range, compare designs, and get a quote at today's rate. Sizing and engraving are done on-site."
              )}
            </p>

            <div className="mt-10 space-y-4">
              {details.map((item) =>
                item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block border-b border-cream-200/10 pb-3 transition-colors hover:border-gold-400/40"
                  >
                    <p className="eyebrow text-muted-400">{t(item.label)}</p>
                    <p className="mt-1 text-lg text-cream-50 transition-colors group-hover:text-gold-300">
                      {item.value}
                    </p>
                  </a>
                ) : (
                  <div
                    key={item.label}
                    className="border-b border-cream-200/10 pb-3"
                  >
                    <p className="eyebrow text-muted-400">{t(item.label)}</p>
                    <p className="mt-1 text-lg text-cream-50">{item.value}</p>
                  </div>
                )
              )}
            </div>

            <div className="mt-10 flex gap-3">
              <Button to="/collection" variant="primary" size="lg">
                {t('Browse the collection')}
              </Button>
              <Button to="/rates" variant="outline" size="lg">
                {t("Today's rates")}
              </Button>
            </div>
          </div>

          {/* Right — map placeholder and directions */}
          <div className="space-y-6">
            <Card>
              <div className="aspect-video w-full bg-forest-850/60 p-8">
                <div className="flex size-full items-center justify-center border border-dashed border-cream-200/20">
                  <p className="text-center text-sm text-muted-400">
                    {t('Map embed placeholder')}
                    <br />
                    <span className="mt-2 block text-xs">
                      {t('Google Maps iframe would go here')}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <CardBody>
                <h2 className="font-display text-xl text-cream-50">{t('Directions')}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-400">
                  <p>
                    <strong className="text-cream-200">{t('From Damak bus park:')}</strong>{' '}
                    {t('Head east on the main road for 600m. The shop is on the left, two doors past the BNPL ATM.')}
                  </p>
                  <p>
                    <strong className="text-cream-200">{t('Parking:')}</strong>{' '}
                    {t('Street parking is available directly outside. The municipal lot is 100m north.')}
                  </p>
                  <p className="pt-2 text-xs text-muted-400/80">
                    GPS: 26.6656° N, 87.6897° E
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
