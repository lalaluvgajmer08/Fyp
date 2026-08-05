import Container from '../components/common/Container';
import Eyebrow from '../components/common/Eyebrow';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';

/**
 * Cart is a placeholder for the ordering module. When built, it will hold:
 * - Saved products with the rate quoted at add-time
 * - Online reservation flow
 * - Staff order processing
 */
export default function Cart() {
  return (
    <div className="bg-forest-900 py-32">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow className="mb-5">Your bag</Eyebrow>
          <h1 className="font-display text-[2.75rem] font-light leading-tight text-cream-50 sm:text-[3.5rem]">
            Nothing in your bag yet
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-400">
            Online ordering is coming soon. For now, browse the collection and visit the shop to
            reserve or purchase a piece. Prices you see today are locked when you add them here,
            so the metal rate moving before you complete your visit won't affect what you pay.
          </p>

          <div className="mt-12 flex gap-4">
            <Button to="/collection" variant="primary" size="lg">
              Browse the collection
            </Button>
            <Button to="/visit" variant="outline" size="lg">
              Plan your visit
            </Button>
          </div>
        </div>

        {/* Mockup of what the cart will look like when items are added */}
        <Card className="mt-16 p-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 flex size-20 items-center justify-center border-2 border-dashed border-cream-200/20 text-muted-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
            </div>
            <p className="font-display text-xl text-cream-50">Your bag is empty</p>
            <p className="mt-2 text-sm text-muted-400">
              Items you save will appear here with their quoted prices
            </p>
          </div>
        </Card>
      </Container>
    </div>
  );
}

