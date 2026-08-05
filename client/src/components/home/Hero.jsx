import Container from '../common/Container';
import Eyebrow from '../common/Eyebrow';
import Button from '../common/Button';
import { SHOP } from '../../config/site';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2000&auto=format&fit=crop';

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      {/* Background photograph */}
      <div className="absolute inset-0 -z-10">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchpriority="high"
          className="size-full object-cover object-center brightness-[1.35] saturate-[0.85]"
        />
        {/* Two overlays: a green wash for brand tone, plus a left-weighted
            gradient so the display type stays legible over the ring. */}
        <div className="absolute inset-0 bg-forest-950/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/75 to-forest-950/10" />
      </div>

      <Container className="flex min-h-[34rem] flex-col justify-center pb-16 pt-32 sm:min-h-[36rem] lg:min-h-[35.75rem] lg:pb-20 lg:pt-36">
        <div className="max-w-2xl">
          <Eyebrow className="mb-6">{SHOP.established}</Eyebrow>

          <h1
            id="hero-heading"
            className="font-display font-light leading-[0.98] text-cream-50 text-[3rem] sm:text-[4rem] lg:text-[4.75rem]"
          >
            Jewellery made to be
            <span className="mt-1 block text-gold-400">inherited</span>
          </h1>

          <p className="mt-8 max-w-xl text-[1.0625rem] leading-[1.75] text-cream-200/90">
            Hand-finished gold, diamond and platinum pieces — priced transparently against
            today&apos;s metal rates, with in-store exchange for your older jewellery.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button onclick={() => {console.log(

            )}} to="/collection" variant="primary" size="lg">
              Shop the collection
            </Button>
            <Button to="/exchange" variant="secondary" size="lg">
              Book an exchange visit
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
