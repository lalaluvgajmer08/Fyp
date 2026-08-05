import Container from '../components/common/Container';
import Eyebrow from '../components/common/Eyebrow';
import { SHOP } from '../config/site';

export default function VisitUs() {
  const details = [
    { label: 'Address', value: SHOP.address },
    { label: 'Telephone', value: SHOP.phone, href: `tel:${SHOP.phone.replace(/\s/g, '')}` },
    { label: 'Email', value: SHOP.email, href: `mailto:${SHOP.email}` },
    { label: 'Opening hours', value: SHOP.hours },
  ];

  return (
    <Container className="py-32">
      <div className="max-w-2xl">
        <Eyebrow className="mb-5">Visit us</Eyebrow>
        <h1 className="font-display text-[2.75rem] font-light leading-tight text-cream-50 sm:text-[3.5rem]">
          The showroom
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-400">
          Valuations, exchanges and custom commissions are handled in person at the counter.
        </p>
      </div>

      <dl className="mt-16 grid max-w-3xl gap-px border border-cream-200/12 bg-cream-200/12 sm:grid-cols-2">
        {details.map((item) => (
          <div key={item.label} className="bg-forest-850 p-7">
            <dt className="eyebrow text-muted-400">{item.label}</dt>
            <dd className="mt-2.5 text-cream-50">
              {item.href ? (
                <a href={item.href} className="transition-colors hover:text-gold-400">
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
